# -*- coding: utf-8 -*-
"""
پیام‌رسان رز | Rose Messenger — شرکت مشاوره رز
بک‌اند: Flask + SQLite — بدون داکر، اجرا مستقیم با python app.py
قابلیت‌ها: احراز هویت، گفت‌وگوی خصوصی، گروه و کانال، ارسال متن/تصویر/فیلم/صوت/فایل،
پاسخ/فوروارد/سنجاق/ویرایش/حذف، وضعیت ارسال/دریافت/خواندن، آنلاین و آخرین بازدید،
جست‌وجو، اعلان و شمارنده نخوانده، ساختار سازمانی (واحد ستادی/مرکز استانی)،
پنل مدیریت، پشتیبان‌گیری و HTTPS اختیاری.
"""
import io
import mimetypes
import os
import secrets
import shutil
import sqlite3
import time
import zipfile
from datetime import timedelta

from flask import (Flask, abort, jsonify, request, send_file,
                   send_from_directory, session)
from werkzeug.security import check_password_hash, generate_password_hash

# ---------------------------------------------------------------- پیکربندی
def load_env(path='.env'):
    """بارگذاری ساده فایل .env بدون وابستگی خارجی"""
    if os.path.exists(path):
        with open(path, encoding='utf-8') as fh:
            for line in fh:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip())

load_env()

DATA = os.getenv('DATA_DIR', 'data')
UPLOADS = os.path.join(DATA, 'uploads')
os.makedirs(UPLOADS, exist_ok=True)
PORT = int(os.getenv('PORT', '8088'))
MIN_PASSWORD = int(os.getenv('MIN_PASSWORD', '12'))
ADMIN_USER = os.getenv('ADMIN_USER', 'admin')
TLS_ENABLED = os.getenv('TLS_ENABLED', '0') == '1'
ONLINE_WINDOW = 70   # ثانیه؛ کاربر با فعالیت اختر در این بازه «آنلاین» است
TYPING_WINDOW = 6    # اعتبار وضعیت «در حال نوشتن» بر حسب ثانیه

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = os.getenv('SECRET_KEY') or secrets.token_hex(32)
app.permanent_session_lifetime = timedelta(days=7)
app.config.update(
    MAX_CONTENT_LENGTH=100 * 1024 * 1024,  # سقف هر فایل: ۱۰۰ مگابایت
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Strict',
    SESSION_COOKIE_SECURE=TLS_ENABLED or os.getenv('SECURE_COOKIE', '0') == '1',
)

INLINE_TYPES = {
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/aac',
    'application/pdf',
}

# ---------------------------------------------------------------- پایگاه داده
SCHEMA = '''
CREATE TABLE IF NOT EXISTS units(
  id   INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'ho'        -- ho = واحد ستادی / prov = مرکز استانی
);
CREATE TABLE IF NOT EXISTS users(
  id       INTEGER PRIMARY KEY,
  name     TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  unit     INTEGER REFERENCES units(id) ON DELETE SET NULL,
  avatar   TEXT,
  active   INTEGER DEFAULT 1,
  last_seen REAL DEFAULT 0,
  created  REAL
);
CREATE TABLE IF NOT EXISTS rooms(
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL DEFAULT '',
  kind    TEXT NOT NULL,                 -- private / group / channel
  owner   INTEGER,
  created REAL
);
CREATE TABLE IF NOT EXISTS members(
  room      INTEGER NOT NULL,
  user      INTEGER NOT NULL,
  role      TEXT DEFAULT 'member',       -- member / admin
  last_read INTEGER DEFAULT 0,
  typing    REAL DEFAULT 0,
  PRIMARY KEY(room, user)
);
CREATE TABLE IF NOT EXISTS messages(
  id       INTEGER PRIMARY KEY,
  room     INTEGER NOT NULL,
  user     INTEGER,
  body     TEXT DEFAULT '',
  file     TEXT,
  filename TEXT,
  mtype    TEXT DEFAULT 'file',          -- image / video / audio / file
  fsize    INTEGER DEFAULT 0,
  reply_to INTEGER,
  pinned   INTEGER DEFAULT 0,
  edited   INTEGER DEFAULT 0,
  created  REAL
);
CREATE INDEX IF NOT EXISTS idx_msg_room ON messages(room, id);
'''

def db():
    c = sqlite3.connect(os.path.join(DATA, 'rose.db'))
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    c.execute('PRAGMA journal_mode=WAL')
    c.execute('PRAGMA busy_timeout=5000')
    return c

def init_db():
    """ساخت جدول‌ها و ارتقای تدریجی پایگاه‌داده نسخه‌های قبلی"""
    with db() as c:
        c.executescript(SCHEMA)
        def cols(t):
            return {r[1] for r in c.execute(f'PRAGMA table_info({t})')}
        def addcol(t, col, decl):
            if col not in cols(t):
                c.execute(f'ALTER TABLE {t} ADD COLUMN {col} {decl}')
        addcol('users', 'is_admin', 'INTEGER DEFAULT 0')
        addcol('users', 'unit', 'INTEGER')
        addcol('users', 'avatar', 'TEXT')
        addcol('users', 'active', 'INTEGER DEFAULT 1')
        addcol('users', 'last_seen', 'REAL DEFAULT 0')
        addcol('users', 'created', 'REAL')
        addcol('rooms', 'created', 'REAL')
        addcol('members', 'role', "TEXT DEFAULT 'member'")
        addcol('members', 'last_read', 'INTEGER DEFAULT 0')
        addcol('members', 'typing', 'REAL DEFAULT 0')
        addcol('messages', 'mtype', "TEXT DEFAULT 'file'")
        addcol('messages', 'fsize', 'INTEGER DEFAULT 0')
        addcol('messages', 'reply_to', 'INTEGER')
        addcol('messages', 'pinned', 'INTEGER DEFAULT 0')
        addcol('messages', 'edited', 'INTEGER DEFAULT 0')
        if os.getenv('ADMIN_PASSWORD'):
            c.execute(
                'INSERT OR IGNORE INTO users(name,password,is_admin,active,created) VALUES (?,?,1,1,?)',
                (ADMIN_USER, generate_password_hash(os.environ['ADMIN_PASSWORD']), time.time()))
            c.execute('UPDATE users SET is_admin=1, active=1 WHERE name=?', (ADMIN_USER,))

init_db()

# ---------------------------------------------------------------- ابزارها
def uid():
    if not session.get('uid'):
        abort(401)
    return session['uid']

def get_user(c, i):
    return c.execute('SELECT * FROM users WHERE id=?', (i,)).fetchone()

def is_admin(c, i):
    u = get_user(c, i)
    return bool(u and u['is_admin'])

def require_admin():
    u = uid()
    with db() as c:
        if not is_admin(c, u):
            abort(403)
    return u

def can_manage(c, u, r):
    """مالک یا مدیر اتاق یا مدیر کل"""
    return r['owner'] == u or r['role'] == 'admin' or is_admin(c, u)

def jsonerr(status, msg):
    """خطای JSON با کد وضعیت درست"""
    return jsonify(error=msg), status

def safe_name(n):
    """پاک‌سازی نام فایل با حفظ حروف فارسی"""
    n = (n or '').replace('\\', '/').split('/')[-1].strip()
    n = ''.join(ch for ch in n if ch.isprintable() and ch not in '\x00')[:150]
    return n or 'فایل'

def file_kind(filename):
    mime = mimetypes.guess_type(filename)[0] or ''
    if mime.startswith('image/'):
        return 'image'
    if mime.startswith('video/'):
        return 'video'
    if mime.startswith('audio/'):
        return 'audio'
    return 'file'

def msg_dict(row, uname, uavatar, reply_body=None, reply_name=None):
    d = dict(id=row['id'], room=row['room'], user=row['user'],
             name=uname or 'کاربر حذف‌شده', avatar=uavatar,
             body=row['body'] or '', file=row['file'], filename=row['filename'],
             mtype=row['mtype'] or 'file', fsize=row['fsize'] or 0,
             reply_to=row['reply_to'], pinned=bool(row['pinned']),
             edited=bool(row['edited']), created=row['created'])
    if row['reply_to']:
        d['reply_body'] = (reply_body or '')[:120]
        d['reply_name'] = reply_name or 'کاربر حذف‌شده'
    return d

def fetch_messages(c, rid, since=0, before=0, limit=200):
    q = ('SELECT messages.*, users.name uname, users.avatar uavatar, '
         'r2.body rbody, r2u.name rname FROM messages '
         'LEFT JOIN users ON users.id=messages.user '
         'LEFT JOIN messages r2 ON r2.id=messages.reply_to '
         'LEFT JOIN users r2u ON r2u.id=r2.user WHERE messages.room=? ')
    if since:
        q += 'AND messages.id>? '
        args = [rid, since]
    elif before:
        q += 'AND messages.id<? '
        args = [rid, before]
    else:
        args = [rid]
    q += 'ORDER BY messages.id ' + ('ASC' if since else 'DESC') + f' LIMIT {int(limit)}'
    rows = [dict(r) for r in c.execute(q, args)]
    if not since:
        rows.reverse()
    # وضعیت دریافت/خواندن برای پیام‌های خود کاربر
    u = uid()
    mem = c.execute(
        'SELECT members.user, members.last_read, users.last_seen FROM members '
        'JOIN users ON users.id=members.user WHERE members.room=?', (rid,)).fetchall()
    others = [m for m in mem if m['user'] != u]
    peer = others[0] if (len(others) == 1 and others[0]) else None
    out = []
    for r in rows:
        d = msg_dict(r, r['uname'], r['uavatar'], r['rbody'], r['rname'])
        if r['user'] == u:
            if peer is not None:
                d['delivered'] = bool(peer['last_seen'] and peer['last_seen'] >= r['created'])
                d['read'] = bool(peer['last_read'] >= r['id'])
            else:
                d['read_count'] = sum(1 for o in others if o['last_read'] >= r['id'])
                d['total'] = len(others)
        out.append(d)
    return out

def rooms_payload(c, u):
    """فهرست اتاق‌های کاربر همراه نخوانده، آخرین پیام، حالت نوشتن و طرف مقابل"""
    rows = c.execute(
        'SELECT rooms.*, members.role, members.last_read FROM rooms '
        'JOIN members ON members.room=rooms.id AND members.user=? '
        'ORDER BY rooms.id DESC', (u,)).fetchall()
    out = []
    for r in rows:
        rid = r['id']
        unread = c.execute('SELECT COUNT(*) n FROM messages WHERE room=? AND id>? AND user<>?',
                           (rid, r['last_read'], u)).fetchone()['n']
        last = c.execute(
            'SELECT messages.*, users.name uname FROM messages '
            'LEFT JOIN users ON users.id=messages.user WHERE room=? ORDER BY id DESC LIMIT 1',
            (rid,)).fetchone()
        typing = [x['name'] for x in c.execute(
            'SELECT users.name FROM members JOIN users ON users.id=members.user '
            'WHERE members.room=? AND members.typing>? AND members.user<>?',
            (rid, time.time() - TYPING_WINDOW, u))]
        peer = None
        if r['kind'] == 'private':
            p = c.execute(
                'SELECT users.id, users.name, users.avatar, users.last_seen, users.is_admin '
                'FROM members JOIN users ON users.id=members.user '
                'WHERE members.room=? AND members.user<>?', (rid, u)).fetchone()
            if p:
                peer = dict(id=p['id'], name=p['name'], avatar=p['avatar'],
                            online=bool(p['last_seen'] and time.time() - p['last_seen'] < ONLINE_WINDOW),
                            last_seen=p['last_seen'] or 0, is_admin=bool(p['is_admin']))
        out.append(dict(id=rid, kind=r['kind'], name=r['name'], owner=r['owner'],
                        role=r['role'], unread=unread,
                        last=dict(id=last['id'], body=last['body'] or '', filename=last['filename'],
                                  mtype=last['mtype'], name=last['uname'] or '',
                                  created=last['created']) if last else None,
                        typing=typing, peer=peer))
    return out

def user_public(row):
    return dict(id=row['id'], name=row['name'], avatar=row['avatar'],
                is_admin=bool(row['is_admin']), unit=row['unit'],
                active=bool(row['active']),
                online=bool(row['last_seen'] and time.time() - row['last_seen'] < ONLINE_WINDOW),
                last_seen=row['last_seen'] or 0)

# ---------------------------------------------------------------- محافظت (CSRF + ضربان)
FAILS = {}

@app.before_request
def guard():
    if request.path.startswith('/api/'):
        if request.method in ('POST', 'PUT', 'DELETE', 'PATCH') and \
                request.path not in ('/api/login', '/api/setup'):
            if request.headers.get('X-CSRF') != session.get('csrf'):
                abort(403)
        if session.get('uid'):
            now = time.time()
            if now - session.get('hb', 0) > 15:
                session['hb'] = now
                with db() as c:
                    c.execute('UPDATE users SET last_seen=? WHERE id=?', (now, session['uid']))

@app.errorhandler(403)
def _403(e):
    return jsonify(error='دسترسی مجاز نیست'), 403

@app.errorhandler(401)
def _401(e):
    return jsonify(error='ابتدا وارد شوید'), 401

@app.errorhandler(404)
def _404(e):
    return jsonify(error='یافت نشد'), 404

@app.errorhandler(413)
def _413(e):
    return jsonify(error='حجم فایل بیش از حد مجاز است (سقف ۱۰۰ مگابایت)'), 413

# ---------------------------------------------------------------- صفحه اصلی
@app.get('/')
def home():
    return send_from_directory('static', 'index.html', max_age=0)

@app.get('/api/health')
def health():
    with db() as c:
        n = c.execute('SELECT COUNT(*) n FROM users').fetchone()['n']
    return jsonify(ok=True, fresh=(n == 0), version='2.0')

# ---------------------------------------------------------------- ورود و خروج
def _fail(ip):
    now = time.time()
    q = [t for t in FAILS.get(ip, []) if now - t < 300]
    FAILS[ip] = q

@app.post('/api/login')
def login():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr) or '?'
    _fail(ip)
    if len(FAILS.get(ip, [])) >= 10:
        abort(429)
    d = request.get_json(silent=True) or {}
    name = (d.get('name') or '').strip()
    with db() as c:
        u = c.execute('SELECT * FROM users WHERE name=?', (name,)).fetchone()
    if not u or not u['active'] or not check_password_hash(u['password'], d.get('password') or ''):
        FAILS.setdefault(ip, []).append(time.time())
        abort(401)
    FAILS.pop(ip, None)
    session.clear()
    session.permanent = True
    session.update(uid=u['id'], csrf=secrets.token_hex(24), hb=time.time())
    with db() as c:
        c.execute('UPDATE users SET last_seen=? WHERE id=?', (time.time(), u['id']))
    return jsonify(id=u['id'], name=u['name'], csrf=session['csrf'],
                   is_admin=bool(u['is_admin']), avatar=u['avatar'])

@app.post('/api/setup')
def setup():
    """فقط در اولین اجرا (وقتی هیچ کاربری نیست) حساب مدیر می‌سازد"""
    with db() as c:
        if c.execute('SELECT COUNT(*) n FROM users').fetchone()['n']:
            abort(403)
        d = request.get_json(silent=True) or {}
        name = (d.get('name') or '').strip()
        pw = d.get('password') or ''
        if not name or len(pw) < MIN_PASSWORD:
            abort(400)
        c.execute('INSERT INTO users(name,password,is_admin,active,created) VALUES (?,?,1,1,?)',
                  (name, generate_password_hash(pw), time.time()))
    return jsonify(ok=True)

@app.get('/api/me')
def me():
    u = uid()
    with db() as c:
        row = get_user(c, u)
        if not row:
            abort(401)
        unit_name = None
        if row['unit']:
            un = c.execute('SELECT name FROM units WHERE id=?', (row['unit'],)).fetchone()
            unit_name = un['name'] if un else None
    d = user_public(row)
    d.update(csrf=session['csrf'], unit_name=unit_name)
    return jsonify(d)

@app.post('/api/logout')
def logout():
    session.clear()
    return jsonify(ok=True)

# ---------------------------------------------------------------- پروفایل
@app.post('/api/me')
def update_me():
    u = uid()
    with db() as c:
        row = get_user(c, u)
        name = (request.form.get('name') or row['name']).strip()
        if not name:
            abort(400)
        if name != row['name'] and c.execute('SELECT 1 FROM users WHERE name=? AND id<>?', (name, u)).fetchone():
            return jsonerr(409, 'این نام کاربری قبلاً گرفته شده')
        pw_hash = row['password']
        if request.form.get('new_password'):
            if not check_password_hash(row['password'], request.form.get('current_password') or ''):
                return jsonerr(403, 'رمز فعلی نادرست است')
            if len(request.form['new_password']) < MIN_PASSWORD:
                return jsonerr(400, f'رمز جدید باید حداقل {MIN_PASSWORD} نویسه باشد')
            pw_hash = generate_password_hash(request.form['new_password'])
        avatar = row['avatar']
        f = request.files.get('avatar')
        if f and f.filename:
            ext = f.filename.rsplit('.', 1)[-1].lower()
            if ext not in ('png', 'jpg', 'jpeg', 'webp', 'gif'):
                return jsonerr(400, 'تصویر پروفایل باید PNG/JPG/WebP/GIF باشد')
            key = secrets.token_hex(16)
            f.save(os.path.join(UPLOADS, key))
            if row['avatar']:
                try:
                    os.remove(os.path.join(UPLOADS, row['avatar']))
                except OSError:
                    pass
            avatar = key
        c.execute('UPDATE users SET name=?, password=?, avatar=? WHERE id=?',
                  (name, pw_hash, avatar, u))
    return jsonify(ok=True)

# ---------------------------------------------------------------- کاربران
@app.route('/api/users', methods=['GET', 'POST'])
def users():
    u = uid()
    with db() as c:
        if request.method == 'POST':
            if not is_admin(c, u):
                abort(403)
            d = request.get_json(silent=True) or {}
            name = (d.get('name') or '').strip()
            pw = d.get('password') or ''
            if not name or len(pw) < MIN_PASSWORD:
                return jsonerr(400, f'رمز باید حداقل {MIN_PASSWORD} نویسه باشد')
            if c.execute('SELECT 1 FROM users WHERE name=?', (name,)).fetchone():
                return jsonerr(409, 'این نام کاربری قبلاً ثبت شده')
            unit = d.get('unit')
            if unit:
                if not c.execute('SELECT 1 FROM units WHERE id=?', (unit,)).fetchone():
                    abort(400)
            else:
                unit = None
            c.execute('INSERT INTO users(name,password,is_admin,unit,active,created) VALUES (?,?,?,?,1,?)',
                      (name, generate_password_hash(pw), 1 if d.get('is_admin') else 0, unit, time.time()))
        rows = c.execute(
            'SELECT users.*, units.name uname FROM users '
            'LEFT JOIN units ON units.id=users.unit ORDER BY users.active DESC, users.name').fetchall()
    return jsonify([dict(user_public(r), unit_name=r['uname']) for r in rows])

@app.put('/api/users/<int:target>')
def edit_user(target):
    admin = uid()
    with db() as c:
        if not is_admin(c, admin):
            abort(403)
        row = get_user(c, target)
        if not row:
            abort(404)
        d = request.get_json(silent=True) or {}
        admins = c.execute('SELECT COUNT(*) n FROM users WHERE is_admin=1 AND active=1').fetchone()['n']
        demoting = ((d.get('is_admin') is False) and row['is_admin']) or (d.get('active') is False and row['is_admin'])
        if demoting and admins <= 1:
            return jsonerr(400, 'حداقل یک مدیر فعال باید باقی بماند')
        pw_hash = generate_password_hash(d['password']) if d.get('password') else row['password']
        if d.get('password') and len(d['password']) < MIN_PASSWORD:
            return jsonerr(400, f'رمز باید حداقل {MIN_PASSWORD} نویسه باشد')
        unit = row['unit']
        if 'unit' in d:
            unit = d['unit'] or None
            if unit and not c.execute('SELECT 1 FROM units WHERE id=?', (unit,)).fetchone():
                abort(400)
        isadm = int(d['is_admin']) if 'is_admin' in d else row['is_admin']
        active = int(d['active']) if 'active' in d else row['active']
        if target == admin and (not active or not isadm):
            return jsonerr(400, 'نمی‌توانید دسترسی خودتان را کم کنید')
        c.execute('UPDATE users SET password=?, unit=?, is_admin=?, active=? WHERE id=?',
                  (pw_hash, unit, isadm, active, target))
    return jsonify(ok=True)

@app.delete('/api/users/<int:target>')
def del_user(target):
    admin = uid()
    with db() as c:
        if not is_admin(c, admin):
            abort(403)
        row = get_user(c, target)
        if not row:
            abort(404)
        if target == admin:
            return jsonerr(400, 'حذف حساب خودتان ممکن نیست')
        if row['is_admin'] and c.execute(
                'SELECT COUNT(*) n FROM users WHERE is_admin=1 AND id<>?', (target,)).fetchone()['n'] == 0:
            return jsonerr(400, 'حداقل یک مدیر باید باقی بماند')
        if row['avatar']:
            try:
                os.remove(os.path.join(UPLOADS, row['avatar']))
            except OSError:
                pass
        c.execute('DELETE FROM members WHERE user=?', (target,))
        c.execute('DELETE FROM users WHERE id=?', (target,))
    return jsonify(ok=True)

# ---------------------------------------------------------------- واحدهای سازمانی
@app.route('/api/units', methods=['GET', 'POST'])
def units():
    u = uid()
    with db() as c:
        if request.method == 'POST':
            if not is_admin(c, u):
                abort(403)
            d = request.get_json(silent=True) or {}
            name = (d.get('name') or '').strip()
            kind = d.get('kind', 'ho')
            if not name or kind not in ('ho', 'prov'):
                abort(400)
            if c.execute('SELECT 1 FROM units WHERE name=?', (name,)).fetchone():
                return jsonerr(409, 'واحدی با این نام وجود دارد')
            c.execute('INSERT INTO units(name,kind) VALUES (?,?)', (name, kind))
        rows = c.execute(
            'SELECT units.*, (SELECT COUNT(*) FROM users WHERE users.unit=units.id) n '
            'FROM units ORDER BY units.kind, units.name').fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/units/<int:uid2>', methods=['PUT', 'DELETE'])
def unit_edit(uid2):
    admin = uid()
    with db() as c:
        if not is_admin(c, admin):
            abort(403)
        row = c.execute('SELECT * FROM units WHERE id=?', (uid2,)).fetchone()
        if not row:
            abort(404)
        if request.method == 'DELETE':
            if c.execute('SELECT COUNT(*) n FROM users WHERE unit=?', (uid2,)).fetchone()['n']:
                return jsonerr(400, 'ابتدا کاربران این واحد را جابه‌جا کنید')
            c.execute('DELETE FROM units WHERE id=?', (uid2,))
            return jsonify(ok=True)
        d = request.get_json(silent=True) or {}
        name = (d.get('name') or row['name']).strip()
        kind = d.get('kind', row['kind'])
        if kind not in ('ho', 'prov'):
            abort(400)
        c.execute('UPDATE units SET name=?, kind=? WHERE id=?', (name, kind, uid2))
    return jsonify(ok=True)

# ---------------------------------------------------------------- اتاق‌ها (خصوصی/گروه/کانال)
@app.route('/api/rooms', methods=['GET', 'POST'])
def rooms():
    u = uid()
    with db() as c:
        if request.method == 'POST':
            d = request.get_json(silent=True) or {}
            kind = d.get('kind')
            name = (d.get('name') or '').strip()[:120]
            ids = list({int(x) for x in (d.get('members') or [])})
            if kind not in ('private', 'group', 'channel'):
                abort(400)
            if kind == 'private' and len(ids) != 1:
                return jsonerr(400, 'برای گفت‌وگوی خصوصی یک مخاطب را انتخاب کنید')
            if kind in ('group', 'channel') and not name:
                return jsonerr(400, 'نام را وارد کنید')
            for i in ids:
                if not c.execute('SELECT 1 FROM users WHERE id=? AND active=1', (i,)).fetchone():
                    return jsonerr(400, 'یکی از کاربران موجود نیست')
            if kind == 'private':
                peer = ids[0]
                if peer == u:
                    abort(400)
                exist = c.execute(
                    'SELECT rooms.id FROM rooms '
                    'JOIN members a ON a.room=rooms.id AND a.user=? '
                    'JOIN members b ON b.room=rooms.id AND b.user=? '
                    'WHERE rooms.kind="private" AND (SELECT COUNT(*) FROM members m WHERE m.room=rooms.id)=2',
                    (u, peer)).fetchone()
                if exist:
                    return jsonify(id=exist['id'], exists=True)
                rid = c.execute('INSERT INTO rooms(name,kind,owner,created) VALUES (?,?,?,?)',
                                ('', 'private', u, time.time())).lastrowid
                c.executemany('INSERT INTO members(room,user) VALUES (?,?)', [(rid, u), (rid, peer)])
                return jsonify(id=rid)
            rid = c.execute('INSERT INTO rooms(name,kind,owner,created) VALUES (?,?,?,?)',
                            (name, kind, u, time.time())).lastrowid
            c.execute('INSERT INTO members(room,user,role) VALUES (?,?,?)', (rid, u, 'admin'))
            for i in set(ids) - {u}:
                c.execute('INSERT INTO members(room,user) VALUES (?,?)', (rid, i))
            return jsonify(id=rid)
        return jsonify(rooms_payload(c, u))

@app.get('/api/rooms/<int:rid>')
def room_info(rid):
    u = uid()
    with db() as c:
        r = c.execute(
            'SELECT rooms.*, members.role FROM rooms '
            'JOIN members ON members.room=rooms.id AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r:
            abort(404)
        members = c.execute(
            'SELECT users.id, users.name, users.avatar, users.is_admin, users.last_seen, '
            'members.role, units.name uname FROM members '
            'JOIN users ON users.id=members.user '
            'LEFT JOIN units ON units.id=users.unit WHERE members.room=? '
            'ORDER BY members.role="admin" DESC, users.name', (rid,)).fetchall()
        pinned = c.execute(
            'SELECT messages.*, users.name uname, users.avatar uavatar FROM messages '
            'LEFT JOIN users ON users.id=messages.user '
            'WHERE room=? AND pinned=1 ORDER BY id DESC LIMIT 3', (rid,)).fetchall()
        return jsonify(id=r['id'], kind=r['kind'], name=r['name'], owner=r['owner'],
                       role=r['role'], manage=can_manage(c, u, r),
                       members=[dict(id=m['id'], name=m['name'], avatar=m['avatar'],
                                     is_admin=bool(m['is_admin']), role=m['role'],
                                     unit_name=m['uname'],
                                     online=bool(m['last_seen'] and time.time() - m['last_seen'] < ONLINE_WINDOW))
                                for m in members],
                       pinned=[msg_dict(p, p['uname'], p['uavatar']) for p in pinned])

@app.put('/api/rooms/<int:rid>')
def rename_room(rid):
    u = uid()
    with db() as c:
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r or r['kind'] == 'private':
            abort(404)
        if not can_manage(c, u, r):
            abort(403)
        name = ((request.get_json(silent=True) or {}).get('name') or '').strip()[:120]
        if not name:
            abort(400)
        c.execute('UPDATE rooms SET name=? WHERE id=?', (name, rid))
    return jsonify(ok=True)

@app.delete('/api/rooms/<int:rid>')
def del_room(rid):
    u = uid()
    with db() as c:
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r:
            if not is_admin(c, u):
                abort(404)
        elif not (r['owner'] == u or is_admin(c, u)):
            abort(403)
        keys = [x['file'] for x in c.execute('SELECT file FROM messages WHERE room=? AND file IS NOT NULL', (rid,))]
        c.execute('DELETE FROM messages WHERE room=?', (rid,))
        c.execute('DELETE FROM members WHERE room=?', (rid,))
        c.execute('DELETE FROM rooms WHERE id=?', (rid,))
    for k in keys:
        try:
            os.remove(os.path.join(UPLOADS, k))
        except OSError:
            pass
    return jsonify(ok=True)

@app.post('/api/rooms/<int:rid>/members')
def add_members(rid):
    u = uid()
    with db() as c:
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r or r['kind'] == 'private':
            abort(404)
        if not can_manage(c, u, r):
            abort(403)
        ids = {int(x) for x in (request.get_json(silent=True) or {}).get('ids') or []}
        for i in ids:
            if c.execute('SELECT 1 FROM users WHERE id=? AND active=1', (i,)).fetchone():
                c.execute('INSERT OR IGNORE INTO members(room,user) VALUES (?,?)', (rid, i))
    return jsonify(ok=True)

@app.delete('/api/rooms/<int:rid>/members/<int:target>')
def remove_member(rid, target):
    u = uid()
    with db() as c:
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r or r['kind'] == 'private':
            abort(404)
        if target != u and not can_manage(c, u, r):
            abort(403)
        if r['owner'] == target and r['kind'] != 'private':
            others = c.execute('SELECT user FROM members WHERE room=? AND user<>? ORDER BY user LIMIT 1',
                               (rid, target)).fetchone()
            if others:
                c.execute('UPDATE rooms SET owner=? WHERE id=?', (others['user'], rid))
        c.execute('DELETE FROM members WHERE room=? AND user=?', (rid, target))
    return jsonify(ok=True)

@app.post('/api/rooms/<int:rid>/role')
def set_role(rid):
    u = uid()
    with db() as c:
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r or r['kind'] == 'private':
            abort(404)
        if not (r['owner'] == u or is_admin(c, u)):
            abort(403)
        d = request.get_json(silent=True) or {}
        if d.get('user') == r['owner']:
            abort(400)
        role = d.get('role')
        if role not in ('member', 'admin'):
            abort(400)
        c.execute('UPDATE members SET role=? WHERE room=? AND user=?', (role, rid, d['user']))
    return jsonify(ok=True)

@app.post('/api/rooms/<int:rid>/read')
def mark_read(rid):
    u = uid()
    with db() as c:
        room_access_real(c, u, rid)
        mid = int((request.get_json(silent=True) or {}).get('mid') or 0)
        c.execute('UPDATE members SET last_read=MAX(last_read,?) WHERE room=? AND user=?', (mid, rid, u))
    return jsonify(ok=True)

def room_access_real(c, u, rid):
    r = c.execute('SELECT rooms.id FROM rooms JOIN members ON members.room=rooms.id AND members.user=? '
                  'WHERE rooms.id=?', (u, rid)).fetchone()
    if not r:
        abort(404)

@app.post('/api/rooms/<int:rid>/typing')
def typing(rid):
    u = uid()
    with db() as c:
        room_access_real(c, u, rid)
        c.execute('UPDATE members SET typing=? WHERE room=? AND user=?', (time.time(), rid, u))
    return jsonify(ok=True)

# ---------------------------------------------------------------- پیام‌ها
@app.route('/api/rooms/<int:rid>/messages', methods=['GET', 'POST'])
def messages(rid):
    u = uid()
    with db() as c:
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, rid)).fetchone()
        if not r:
            abort(404)
        if request.method == 'POST':
            if r['kind'] == 'channel' and not can_manage(c, u, r):
                return jsonerr(403, 'در کانال فقط مدیران می‌توانند پیام بگذارند')
            body = (request.form.get('body') or '').strip()[:10000]
            reply_to = request.form.get('reply_to')
            if reply_to:
                reply_to = int(reply_to)
                rp = c.execute('SELECT id FROM messages WHERE id=? AND room=?', (reply_to, rid)).fetchone()
                if not rp:
                    reply_to = None
            f = request.files.get('file')
            key = fname = mtype = None
            fsize = 0
            if f and f.filename:
                fname = safe_name(f.filename)
                key = secrets.token_hex(24)
                mtype = file_kind(fname)
                f.save(os.path.join(UPLOADS, key))
                fsize = os.path.getsize(os.path.join(UPLOADS, key))
            if not body and not key:
                abort(400)
            mid = c.execute(
                'INSERT INTO messages(room,user,body,file,filename,mtype,fsize,reply_to,created) '
                'VALUES (?,?,?,?,?,?,?,?,?)',
                (rid, u, body, key, fname, mtype or 'file', fsize, reply_to, time.time())).lastrowid
            row = c.execute(
                'SELECT messages.*, users.name uname, users.avatar uavatar, '
                'r2.body rbody, r2u.name rname FROM messages '
                'LEFT JOIN users ON users.id=messages.user '
                'LEFT JOIN messages r2 ON r2.id=messages.reply_to '
                'LEFT JOIN users r2u ON r2u.id=r2.user WHERE messages.id=?', (mid,)).fetchone()
            d = msg_dict(row, row['uname'], row['uavatar'], row['rbody'], row['rname'])
            d['read'] = d['delivered'] = False
            if r['kind'] == 'group':
                tot = c.execute('SELECT COUNT(*) n FROM members WHERE room=? AND user<>?', (rid, u)).fetchone()['n']
                d['read_count'] = 0
                d['total'] = tot
            return jsonify(d)
        since = int(request.args.get('since') or 0)
        before = int(request.args.get('before') or 0)
        limit = min(int(request.args.get('limit') or 200), 400)
        return jsonify(fetch_messages(c, rid, since, before, limit))

@app.put('/api/messages/<int:mid>')
def edit_msg(mid):
    u = uid()
    with db() as c:
        row = c.execute('SELECT * FROM messages WHERE id=?', (mid,)).fetchone()
        if not row:
            abort(404)
        room_access_real(c, u, row['room'])
        if row['user'] != u:
            abort(403)
        body = ((request.get_json(silent=True) or {}).get('body') or '').strip()[:10000]
        if not body and not row['file']:
            abort(400)
        c.execute('UPDATE messages SET body=?, edited=1 WHERE id=?', (body, mid))
    return jsonify(ok=True)

@app.delete('/api/messages/<int:mid>')
def del_msg(mid):
    u = uid()
    with db() as c:
        row = c.execute('SELECT * FROM messages WHERE id=?', (mid,)).fetchone()
        if not row:
            abort(404)
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, row['room'])).fetchone()
        if row['user'] != u and not (r and can_manage(c, u, r)):
            abort(403)
        c.execute('DELETE FROM messages WHERE id=?', (mid,))
        key = row['file']
    if key:
        try:
            os.remove(os.path.join(UPLOADS, key))
        except OSError:
            pass
    return jsonify(ok=True)

@app.post('/api/messages/<int:mid>/pin')
def pin_msg(mid):
    u = uid()
    with db() as c:
        row = c.execute('SELECT * FROM messages WHERE id=?', (mid,)).fetchone()
        if not row:
            abort(404)
        r = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                      'AND members.user=? WHERE rooms.id=?', (u, row['room'])).fetchone()
        if not r:
            abort(404)
        if not can_manage(c, u, r):
            abort(403)
        newv = 0 if row['pinned'] else 1
        c.execute('UPDATE messages SET pinned=? WHERE id=?', (newv, mid))
    return jsonify(pinned=bool(newv))

@app.post('/api/messages/<int:mid>/forward')
def forward_msg(mid):
    u = uid()
    with db() as c:
        row = c.execute('SELECT * FROM messages WHERE id=?', (mid,)).fetchone()
        if not row:
            abort(404)
        room_access_real(c, u, row['room'])
        target = int((request.get_json(silent=True) or {}).get('room') or 0)
        tr = c.execute('SELECT rooms.*, members.role FROM rooms JOIN members ON members.room=rooms.id '
                       'AND members.user=? WHERE rooms.id=?', (u, target)).fetchone()
        if not tr:
            abort(404)
        if tr['kind'] == 'channel' and not can_manage(c, u, tr):
            abort(403)
        key = row['file']
        if key:
            src = os.path.join(UPLOADS, key)
            if os.path.exists(src):
                nkey = secrets.token_hex(24)
                shutil.copyfile(src, os.path.join(UPLOADS, nkey))
                key = nkey
        c.execute(
            'INSERT INTO messages(room,user,body,file,filename,mtype,fsize,created) VALUES (?,?,?,?,?,?,?,?)',
            (target, u, row['body'], key, row['filename'], row['mtype'], row['fsize'], time.time()))
    return jsonify(ok=True)

# ---------------------------------------------------------------- هم‌گام‌سازی و جست‌وجو
@app.get('/api/sync')
def sync():
    u = uid()
    with db() as c:
        online = [x['id'] for x in c.execute(
            'SELECT id FROM users WHERE active=1 AND last_seen>?', (time.time() - ONLINE_WINDOW,))]
        return jsonify(rooms=rooms_payload(c, u), online=online, ts=time.time())

@app.get('/api/search')
def search():
    u = uid()
    q = (request.args.get('q') or '').strip()
    if len(q) < 2:
        return jsonify(users=[], rooms=[], messages=[], files=[])
    like = f'%{q}%'
    with db() as c:
        us = c.execute(
            'SELECT users.*, units.name uname FROM users LEFT JOIN units ON units.id=users.unit '
            'WHERE users.active=1 AND users.name LIKE ? ORDER BY users.name LIMIT 10', (like,)).fetchall()
        rs = c.execute(
            'SELECT rooms.* FROM rooms JOIN members ON members.room=rooms.id AND members.user=? '
            'WHERE rooms.name LIKE ? ORDER BY rooms.id DESC LIMIT 10', (u, like)).fetchall()
        ms = c.execute(
            'SELECT messages.id, messages.room, messages.body, messages.created, messages.user, '
            'users.name uname, rooms.name rname, rooms.kind rkind FROM messages '
            'JOIN members ON members.room=messages.room AND members.user=? '
            'LEFT JOIN users ON users.id=messages.user '
            'LEFT JOIN rooms ON rooms.id=messages.room '
            'WHERE messages.body LIKE ? ORDER BY messages.id DESC LIMIT 30', (u, like)).fetchall()
        fs = c.execute(
            'SELECT messages.id, messages.room, messages.filename, messages.mtype, messages.created, '
            'rooms.name rname FROM messages '
            'JOIN members ON members.room=messages.room AND members.user=? '
            'LEFT JOIN rooms ON rooms.id=messages.room '
            'WHERE messages.file IS NOT NULL AND messages.filename LIKE ? '
            'ORDER BY messages.id DESC LIMIT 20', (u, like)).fetchall()
    return jsonify(
        users=[dict(user_public(x), unit_name=x['uname']) for x in us],
        rooms=[dict(x) for x in rs],
        messages=[dict(id=x['id'], room=x['room'], body=(x['body'] or '')[:120], created=x['created'],
                       name=x['uname'] or '', room_name=x['rname'] or '', kind=x['rkind']) for x in ms],
        files=[dict(id=x['id'], room=x['room'], filename=x['filename'], mtype=x['mtype'],
                    created=x['created'], room_name=x['rname'] or '') for x in fs])

# ---------------------------------------------------------------- فایل‌ها و آواتار
@app.get('/api/file/<key>')
def get_file(key):
    u = uid()
    with db() as c:
        m = c.execute('SELECT room, filename, mtype FROM messages WHERE file=?', (key,)).fetchone()
        if not m:
            abort(404)
        room_access_real(c, u, m['room'])
    path = os.path.join(UPLOADS, key)
    if not os.path.exists(path):
        abort(404)
    mime = mimetypes.guess_type(m['filename'] or '')[0] or 'application/octet-stream'
    download = request.args.get('dl') == '1' or mime not in INLINE_TYPES
    resp = send_file(path, mimetype=mime, conditional=True,
                     as_attachment=download,
                     download_name=m['filename'] or 'فایل')
    resp.headers['X-Content-Type-Options'] = 'nosniff'
    resp.headers['Cache-Control'] = 'private, max-age=604800, immutable'
    return resp

@app.get('/api/avatar/<key>')
def get_avatar(key):
    uid()
    if not all(ch in '0123456789abcdef' for ch in key.lower()):
        abort(404)
    path = os.path.join(UPLOADS, key)
    if not os.path.exists(path):
        abort(404)
    mime = mimetypes.guess_type(path)[0] or 'image/png'
    resp = send_file(path, mimetype=mime, conditional=True)
    resp.headers['X-Content-Type-Options'] = 'nosniff'
    resp.headers['Cache-Control'] = 'private, max-age=86400'
    return resp

# ---------------------------------------------------------------- پنل مدیریت
@app.get('/api/admin/stats')
def admin_stats():
    u = uid()
    with db() as c:
        if not is_admin(c, u):
            abort(403)
        users_total = c.execute('SELECT COUNT(*) n FROM users').fetchone()['n']
        users_active = c.execute('SELECT COUNT(*) n FROM users WHERE active=1').fetchone()['n']
        online = c.execute('SELECT COUNT(*) n FROM users WHERE last_seen>? AND active=1',
                           (time.time() - ONLINE_WINDOW,)).fetchone()['n']
        rooms = {}
        for k in ('private', 'group', 'channel'):
            rooms[k] = c.execute('SELECT COUNT(*) n FROM rooms WHERE kind=?', (k,)).fetchone()['n']
        msgs = c.execute('SELECT COUNT(*) n FROM messages').fetchone()['n']
        files = c.execute('SELECT COUNT(*) n FROM messages WHERE file IS NOT NULL').fetchone()['n']
        size = 0
        for f in os.listdir(UPLOADS):
            try:
                size += os.path.getsize(os.path.join(UPLOADS, f))
            except OSError:
                pass
    return jsonify(users=users_total, active=users_active, online=online, rooms=rooms,
                   messages=msgs, files=files, storage=size)

@app.get('/api/admin/rooms')
def admin_rooms():
    u = uid()
    with db() as c:
        if not is_admin(c, u):
            abort(403)
        rows = c.execute(
            'SELECT rooms.*, users.name owner_name, '
            '(SELECT COUNT(*) FROM members WHERE members.room=rooms.id) nmem, '
            '(SELECT COUNT(*) FROM messages WHERE messages.room=rooms.id) nmsg FROM rooms '
            'LEFT JOIN users ON users.id=rooms.owner ORDER BY rooms.id DESC').fetchall()
    return jsonify([dict(x) for x in rows])

@app.get('/api/admin/backup')
def admin_backup():
    u = uid()
    with db() as c:
        if not is_admin(c, u):
            abort(403)
    stamp = time.strftime('%Y-%m-%d_%H-%M')
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        tmpdb = os.path.join(DATA, f'.backup-{stamp}.db')
        src = sqlite3.connect(os.path.join(DATA, 'rose.db'))
        dst = sqlite3.connect(tmpdb)
        src.backup(dst)
        dst.close()
        src.close()
        zf.write(tmpdb, 'rose.db')
        os.remove(tmpdb)
        for f in os.listdir(UPLOADS):
            p = os.path.join(UPLOADS, f)
            if os.path.isfile(p):
                zf.write(p, f'uploads/{f}')
    buf.seek(0)
    return send_file(buf, mimetype='application/zip', as_attachment=True,
                     download_name=f'rose-backup-{stamp}.zip')

# ---------------------------------------------------------------- اجرا
def ensure_tls_cert():
    """ساخت گواهی self-signed برای HTTPS داخلی (برای میکروفون و دوربین لازم است)"""
    cert = os.path.join(DATA, 'rose-cert.pem')
    key = os.path.join(DATA, 'rose-key.pem')
    if os.path.exists(cert) and os.path.exists(key):
        return cert, key
    import datetime
    import ipaddress
    import socket
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID
    k = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    san = [x509.DNSName('localhost')]
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = ipaddress.IPv4Address(info[4][0])
            san.append(x509.IPAddress(ip))
    except OSError:
        pass
    extra = os.getenv('TLS_HOST', '')
    for item in extra.split(','):
        item = item.strip()
        if not item:
            continue
        try:
            san.append(x509.IPAddress(ipaddress.IPv4Address(item)))
        except ValueError:
            san.append(x509.DNSName(item))
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Rose Messenger')])
    certobj = (x509.CertificateBuilder()
               .subject_name(subject).issuer_name(issuer)
               .public_key(k.public_key()).serial_number(x509.random_serial_number())
               .not_valid_before(datetime.datetime.utcnow() - datetime.timedelta(days=1))
               .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=825))
               .add_extension(x509.SubjectAlternativeName(san), critical=False)
               .sign(k, hashes.SHA256()))
    with open(key, 'wb') as fh:
        fh.write(k.private_bytes(serialization.Encoding.PEM,
                                 serialization.PrivateFormat.TraditionalOpenSSL,
                                 serialization.NoEncryption()))
    with open(cert, 'wb') as fh:
        fh.write(certobj.public_bytes(serialization.Encoding.PEM))
    return cert, key

if __name__ == '__main__':
    init_db()
    if TLS_ENABLED:
        cpath, kpath = ensure_tls_cert()
        print(f'* Rose Messenger | HTTPS روی پورت {PORT} — https://0.0.0.0:{PORT}')
        app.run(host='0.0.0.0', port=PORT, ssl_context=(cpath, kpath), threaded=True)
    else:
        from waitress import serve
        print(f'* Rose Messenger | HTTP روی پورت {PORT} — http://0.0.0.0:{PORT}')
        serve(app, host='0.0.0.0', port=PORT, threads=8)
