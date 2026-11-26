'use strict';
/* پیام‌رسان رز | Rose Messenger — اسکریپت اصلی */

/* ================= آیکون‌ها ================= */
const I = {
  search:'<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  chat:'<path d="M21 12a8 8 0 0 1-8 8H4l2.2-3.2A8 8 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  users:'<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="9" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17.5 15.5c2.2.4 3.7 1.9 4.3 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  send:'<path d="M21 3 10.5 13.5M21 3l-6.5 18-3.9-7.5L3 9.8 21 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  clip:'<path d="m20 11-7.6 7.6a5 5 0 0 1-7-7l8.3-8.3a3.4 3.4 0 0 1 4.8 4.8l-8.2 8.2a1.8 1.8 0 0 1-2.5-2.5l7.5-7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  smile:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/>',
  pin:'<path d="M9 4h6l1 7 2.5 2.5v2h-13v-2L8 11l1-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 15.5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  reply:'<path d="m16 7 4 4-4 4M20 11H9a5 5 0 0 0-5 5v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  forward:'<path d="m8 7-4 4 4 4M4 11h11a5 5 0 0 1 5 5v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  edit:'<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17l-1 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  x:'<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  check:'<path d="M4.5 12.5 10 18 19.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  checks:'<path d="m2.5 12.5 4.5 4.5L16 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="m10.5 15.5 2.5 2.5L22 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  shield:'<path d="M12 3l7.5 2.8v5.4c0 4.6-3 8-7.5 9.8-4.5-1.8-7.5-5.2-7.5-9.8V5.8L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m8.8 11.8 2.3 2.3 4.3-4.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  info:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  dots:'<circle cx="12" cy="5.5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="18.5" r="1.7" fill="currentColor"/>',
  arrow:'<path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  image:'<rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><path d="m6 18 4.5-4.5 3 3 2.5-2.5L20 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 12 5-3.5v7L16 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  audio:'<circle cx="7" cy="17" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="15" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 17V7l10-2v10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  file:'<path d="M6 3h8l4 4v14H6V3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 3v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  download:'<path d="M12 4v11m0 0 4-4m-4 4-4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  crown:'<path d="M4 17h16M5 16l-1-8 4.5 3L12 5l3.5 6L20 8l-1 8H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  userplus:'<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 6v6M15 9h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  userminus:'<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 9h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  logout:'<path d="M14 4h6v16h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 8l-4 4 4 4M8 12h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  settings:'<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3.5 13 6a6.5 6.5 0 0 1 2.6 1.5l2.5-.7 1.5 2.6-1.8 1.9a6.5 6.5 0 0 1 0 3l1.8 1.9-1.5 2.6-2.5-.7A6.5 6.5 0 0 1 13 19l-1 2.5L11 19a6.5 6.5 0 0 1-2.6-1.5l-2.5.7-1.5-2.6 1.8-1.9a6.5 6.5 0 0 1 0-3L4.4 8.8 5.9 6.2l2.5.7A6.5 6.5 0 0 1 11 6l1-2.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;
document.querySelectorAll('[data-ic]').forEach(e => { e.innerHTML = icon(e.dataset.ic); });

/* ================= ابزارها ================= */
const $ = s => document.querySelector(s);
const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
const fa = n => Number(n || 0).toLocaleString('fa-IR');
const pad2 = n => String(n).padStart(2, '0');
const fmtTime = ts => new Date(ts * 1000).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fmtDate = ts => new Date(ts * 1000).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtDT = ts => ts ? new Date(ts * 1000).toLocaleString('fa-IR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : '—';
const fmtSize = b => b < 1024 ? fa(b) + ' بایت' : b < 1048576 ? fa((b / 1024).toFixed(1)) + ' کیلوبایت' : fa((b / 1048576).toFixed(1)) + ' مگابایت';
const sameDay = (a, b) => new Date(a * 1000).toDateString() === new Date(b * 1000).toDateString();
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const AV_COLORS = ['#a63f68', '#7d5ba6', '#3f7ea6', '#3f9d74', '#b07f3f', '#a6593f', '#6b3fa6', '#3f8fa6', '#8f3155', '#4f7d5b'];
const avColor = name => { let h = 0; for (const ch of (name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
function avEl(name, av, cls = 'sm') {
  const d = el('span', 'av ' + cls);
  d.style.background = avColor(name);
  if (av) { const img = new Image(); img.src = '/api/avatar/' + av; img.alt = name || ''; d.append(img); }
  else d.textContent = (name || '؟').trim().charAt(0) || '؟';
  return d;
}
function groupAv(cls = 'md') {
  const d = el('span', 'av ' + cls);
  d.style.background = '#f2cbd9'; d.style.color = '#8f3155';
  d.innerHTML = icon('users');
  return d;
}
function toast(msg, err) {
  const t = $('#toast');
  t.textContent = msg; t.className = err ? 'err' : ''; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 2800);
}
let audioCtx = null;
function beep() {
  if (localStorage.getItem('rose_sound') === '0') return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = 880; g.gain.value = .06;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + .14);
  } catch (_) {}
}

/* ================= وضعیت ================= */
const S = {
  me: null, rooms: [], users: [], units: [], online: new Set(),
  cur: null, info: null, msgs: [], lastId: 0, oldest: 0,
  reply: null, editing: null, pending: [], voice: null, rec: null, recCanceled: false,
  tab: 'chats', fwdMsg: null, adTab: 'stats', pickCb: null, typingSent: 0
};
const prevLast = {};

/* ================= ارتباط با سرور ================= */
async function api(url, method = 'GET', data) {
  const h = { 'X-CSRF': S.me ? S.me.csrf : '' };
  let body;
  if (data instanceof FormData) body = data;
  else if (data != null) { h['Content-Type'] = 'application/json'; body = JSON.stringify(data); }
  const res = await fetch('/api/' + url, { method, headers: h, body });
  if (res.status === 401) {
    if (S.me) { sessionEnd(); throw new Error('نشست شما پایان یافته؛ دوباره وارد شوید'); }
    throw new Error('unauthorized');
  }
  let j = null; try { j = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error((j && j.error) || ('خطای ' + res.status));
  return j;
}
function sessionEnd() {
  window.RoseCall?.cleanup();
  S.me = null;
  $('#app').hidden = true; $('#login').hidden = false;
}

/* ================= ورود ================= */
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('#lxErr').textContent = '';
  try {
    const u = await api('login', 'POST', { name: $('#lxUser').value.trim(), password: $('#lxPass').value });
    $('#lxPass').value = '';
    enterApp(u);
    if ('Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch (_) {}
    }
  } catch (err) { $('#lxErr').textContent = err.message === 'unauthorized' ? 'نام کاربری یا رمز نادرست است' : err.message; }
});
$('#setupForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('#sxErr').textContent = '';
  try {
    await api('setup', 'POST', { name: $('#sxUser').value.trim(), password: $('#sxPass').value });
    toast('حساب مدیر ساخته شد؛ اکنون وارد شوید');
    $('#setupForm').hidden = true; $('#loginForm').hidden = false;
  } catch (err) { $('#sxErr').textContent = err.message; }
});

function enterApp(u) {
  S.me = u;
  if (!S.cur) $('#sidebar').classList.add('open');
  $('#login').hidden = true; $('#app').hidden = false;
  $('#chipAv').replaceChildren(avEl(u.name, u.avatar, 'sm'));
  $('#chipName').textContent = u.name;
  $('#btnAdmin').hidden = !u.is_admin;
  $('#chBack').hidden = false;
  syncTick().catch(() => {});
  roomTick().catch(() => {});
}

/* ================= حلقه‌های هم‌گام‌سازی ================= */
let syncing = false;
async function syncTick() {
  if (!S.me || syncing) return;
  syncing = true;
  try { await syncOnce(); } finally { syncing = false; }
}
async function syncOnce() {
  const d = await api('sync' + (window.RoseCall ? '?cs=' + RoseCall.lastSig() : ''));
  S.rooms = d.rooms; S.online = new Set(d.online);
  for (const r of d.rooms) {
    const lid = r.last ? r.last.id : 0, p = prevLast[r.id] || 0;
    if (lid > p && p > 0 && r.last && r.last.name !== S.me.name &&
        (r.id !== (S.cur && S.cur.id) || document.hidden)) {
      beep(); notifyRoom(r, r.last);
    }
    prevLast[r.id] = lid;
  }
  try { const [us, un] = await Promise.all([api('users'), api('units')]); S.users = us; S.units = un; } catch (_) {}
  if (window.RoseCall) await RoseCall.onSync(d.call);
  renderRooms();
  if (S.tab === 'contacts' && !searching()) renderContacts();
  updateTitle();
  if (S.cur) { const cr = S.rooms.find(x => x.id === S.cur.id); if (cr) { S.cur = cr; updateHeader(); } }
}
async function roomTick() {
  if (!S.me || !S.cur || document.hidden) return;
  const d = await api(`rooms/${S.cur.id}/messages?since=${S.lastId}`);
  if (d.length) {
    S.msgs.push(...d);
    S.lastId = d[d.length - 1].id;
    for (const m of d) appendMsg(m);
    autoScroll();
    markRead();
  }
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && S.me) { roomTick().catch(() => {}); syncTick().catch(() => {}); }
});
function updateTitle() {
  const t = S.rooms.reduce((a, r) => a + (r.unread || 0), 0);
  document.title = t ? `(${fa(t)}) پیام‌رسان رز` : 'پیام‌رسان رز';
}
function notifyRoom(r, last) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(roomName(r) + ' — پیام‌رسان رز', {
      body: lastText(r, last), tag: 'rose-' + r.id
    });
    n.onclick = () => { window.focus(); openRoom(r.id); n.close(); };
  } catch (_) {}
}

/* ================= فهرست گفت‌وگوها ================= */
function roomName(r) { return r.kind === 'private' ? (r.peer ? r.peer.name : 'گفت‌وگو') : r.name; }
function lastText(r, last) {
  if (!last) return '';
  const f = last.mtype === 'image' ? 'تصویر' : last.mtype === 'video' ? 'فیلم' : last.mtype === 'audio' ? 'پیام صوتی' : 'فایل: ' + (last.filename || '');
  return last.body ? (r.kind === 'private' ? last.body : last.name + ': ' + last.body) : f;
}
function renderRooms() {
  const box = $('#roomList');
  box.replaceChildren();
  const rs = [...S.rooms].sort((a, b) => ((b.last && b.last.created) || b.id) - ((a.last && a.last.created) || a.id));
  if (!rs.length) { box.append(el('div', 'empty-list', 'هنوز گفت‌وگویی ندارید؛ با دکمه پایین گفت‌وگوی تازه بسازید.')); return; }
  for (const r of rs) {
    const row = el('button', 'row' + (S.cur && S.cur.id === r.id ? ' on' : ''));
    const avw = el('span', 'r-av');
    if (r.kind === 'private' && r.peer) {
      avw.append(avEl(r.peer.name, r.peer.avatar, 'md'));
      if (r.peer.online) avw.append(el('span', 'dot on'));
      else avw.append(el('span', 'dot'));
    } else avw.append(groupAv('md'));
    const main = el('div', 'r-main');
    const nm = el('div', 'r-name');
    nm.append(el('span', null, roomName(r)));
    if (r.kind === 'private' && r.peer && r.peer.is_admin) nm.append(el('span', 'role-tag', 'مدیر'));
    const sub = el('div', 'r-sub');
    if (r.typing && r.typing.length) { sub.textContent = r.typing.join('، ') + ' در حال نوشتن…'; sub.classList.add('typing'); }
    else sub.textContent = r.last ? lastText(r, r.last) : 'بدون پیام';
    main.append(nm, sub);
    const side = el('div', 'r-side');
    if (r.last) side.append(el('span', 'r-time', fmtTime(r.last.created)));
    if (r.unread) side.append(el('span', 'badge', fa(r.unread)));
    row.append(avw, main, side);
    row.onclick = () => openRoom(r.id);
    box.append(row);
  }
}

/* ================= مخاطبین ================= */
function searching() { return $('#q').value.trim().length >= 2; }
function renderContacts() {
  const box = $('#contactList');
  box.replaceChildren();
  const groups = {};
  for (const u of S.users) {
    if (!u.active) continue;
    const key = u.unit_name || 'بدون واحد';
    (groups[key] = groups[key] || []).push(u);
  }
  const ordered = [];
  for (const un of S.units) if (groups[un.name]) ordered.push([un.name, un.kind === 'ho' ? 'واحد ستادی' : 'مرکز استانی', groups[un.name]]);
  if (groups['بدون واحد']) ordered.push(['بدون واحد', '', groups['بدون واحد']]);
  if (!ordered.length) box.append(el('div', 'empty-list', 'کاربری یافت نشد.'));
  for (const [name, label, users] of ordered) {
    box.append(el('div', 'sect', label ? `${name} (${label})` : name));
    for (const u of users.sort((a, b) => a.name.localeCompare(b.name, 'fa'))) {
      const row = el('button', 'row');
      const avw = el('span', 'r-av');
      avw.append(avEl(u.name, u.avatar, 'md'));
      avw.append(el('span', 'dot' + (u.online ? ' on' : '')));
      const main = el('div', 'r-main');
      const nm = el('div', 'r-name'); nm.append(el('span', null, u.name));
      if (u.is_admin) { const t = el('span', 'role-tag', 'مدیر سامانه'); nm.append(t); }
      main.append(nm, el('div', 'r-sub', u.online ? 'آنلاین' : 'آخرین بازدید: ' + fmtDT(u.last_seen)));
      row.append(avw, main);
      row.onclick = () => privateRoom(u.id);
      box.append(row);
    }
  }
}
async function privateRoom(uid) {
  try {
    const exist = S.rooms.find(r => r.kind === 'private' && r.peer && r.peer.id === uid);
    if (exist) return openRoom(exist.id);
    const res = await api('rooms', 'POST', { kind: 'private', members: [uid] });
    await syncTick();
    openRoom(res.id);
  } catch (e) { toast(e.message, true); }
}

/* ================= جست‌وجو ================= */
const doSearch = debounce(async () => {
  const q = $('#q').value.trim();
  $('#qClear').hidden = !q;
  if (q.length < 2) { showTab(S.tab); return; }
  let d;
  try { d = await api('search?q=' + encodeURIComponent(q)); } catch (_) { return; }
  $('#roomList').hidden = true; $('#contactList').hidden = true;
  const box = $('#searchRes'); box.hidden = false; box.replaceChildren();
  const sect = t => box.append(el('div', 'sect', t));
  if (d.users.length) {
    sect('کاربران');
    for (const u of d.users) {
      const row = el('button', 'row');
      const avw = el('span', 'r-av'); avw.append(avEl(u.name, u.avatar, 'md')); avw.append(el('span', 'dot' + (u.online ? ' on' : '')));
      const main = el('div', 'r-main'); main.append(el('div', 'r-name', u.name), el('div', 'r-sub', u.unit_name || ''));
      row.append(avw, main); row.onclick = () => privateRoom(u.id); box.append(row);
    }
  }
  if (d.rooms.length) {
    sect('گفت‌وگوها');
    for (const r of d.rooms) {
      const row = el('button', 'row');
      const avw = el('span', 'r-av'); avw.append(r.kind === 'private' ? avEl(r.name || '؟', null, 'md') : groupAv('md'));
      const main = el('div', 'r-main'); main.append(el('div', 'r-name', r.name || 'گفت‌وگوی خصوصی'), el('div', 'r-sub', { group: 'گروه', channel: 'کانال', private: 'خصوصی' }[r.kind]));
      row.append(avw, main); row.onclick = () => openRoom(r.id); box.append(row);
    }
  }
  if (d.messages.length) {
    sect('پیام‌ها');
    for (const m of d.messages) {
      const row = el('button', 'row');
      const avw = el('span', 'r-av'); const a = avEl(m.name || '؟', null, 'md'); avw.append(a);
      const main = el('div', 'r-main');
      main.append(el('div', 'r-name', (m.room_name || 'گفت‌وگو') + ' — ' + (m.name || '')),
                  el('div', 'r-sub', m.body), el('div', 'r-time', fmtDT(m.created)));
      row.append(avw, main); row.onclick = () => openRoom(m.room, m.id); box.append(row);
    }
  }
  if (d.files.length) {
    sect('فایل‌ها');
    for (const f of d.files) {
      const row = el('button', 'row');
      const avw = el('span', 'r-av'); const g = groupAv('md'); g.innerHTML = icon(f.mtype === 'image' ? 'image' : f.mtype === 'video' ? 'video' : f.mtype === 'audio' ? 'audio' : 'file'); avw.append(g);
      const main = el('div', 'r-main'); main.append(el('div', 'r-name', f.filename), el('div', 'r-sub', f.room_name + ' — ' + fmtDT(f.created)));
      row.append(avw, main); row.onclick = () => openRoom(f.room, f.id); box.append(row);
    }
  }
  if (!box.children.length) box.append(el('div', 'empty-list', 'نتیجه‌ای یافت نشد.'));
}, 300);
$('#q').addEventListener('input', doSearch);
$('#qClear').onclick = () => { $('#q').value = ''; showTab(S.tab); };
function showTab(t) {
  S.tab = t;
  $('#tabChats').classList.toggle('on', t === 'chats');
  $('#tabContacts').classList.toggle('on', t === 'contacts');
  $('#q').value = ''; $('#qClear').hidden = true;
  $('#searchRes').hidden = true;
  $('#roomList').hidden = t !== 'chats';
  $('#contactList').hidden = t !== 'contacts';
  if (t === 'contacts') renderContacts(); else renderRooms();
}
$('#tabChats').onclick = () => showTab('chats');
$('#tabContacts').onclick = () => showTab('contacts');

/* ================= باز کردن اتاق ================= */
const canPost = r => !r || r.kind !== 'channel' || r.role === 'admin' || r.owner === S.me.id || S.me.is_admin;
const canManageRoom = () => S.cur && (S.cur.owner === S.me.id || S.cur.role === 'admin' || S.me.is_admin);

async function openRoom(id, jumpId) {
  const r = S.rooms.find(x => x.id === id);
  if (!r) return;
  S.cur = r; S.reply = null; S.editing = null;
  $('#replyBar').hidden = true; $('#editBar').hidden = true;
  S.pending = []; S.voice = null; renderChips();
  $('#welcome').hidden = true;
  $('#msgs').hidden = false; $('#msgs').replaceChildren();
  $('#composerWrap').hidden = !canPost(r);
  $('#chatHeader').classList.remove('empty');
  $('#chInfo').hidden = false; $('#chMore').hidden = false;
  closeMembers();
  renderHeaderBase();
  let info, ms;
  try { [info, ms] = await Promise.all([api('rooms/' + id), api('rooms/' + id + '/messages?limit=200')]); }
  catch (e) { toast(e.message, true); return; }
  if (!S.cur || S.cur.id !== id) return;
  S.info = info; S.msgs = ms;
  S.lastId = ms.length ? ms[ms.length - 1].id : 0;
  S.oldest = ms.length ? ms[0].id : 0;
  renderPinned(info.pinned);
  renderMembersPanel();
  renderMsgs();
  scrollBottom(false);
  markRead();
  updateHeader();
  renderRooms();
  if (innerWidth <= 820) $('#sidebar').classList.remove('open');
  if (jumpId) setTimeout(() => scrollToMsg(jumpId), 60);
}
function renderHeaderBase() {
  const r = S.cur;
  const avw = $('#chAv'); avw.replaceChildren();
  if (r.kind === 'private' && r.peer) avw.append(avEl(r.peer.name, r.peer.avatar, 'md'));
  else avw.append(groupAv('md'));
  $('#chName').textContent = roomName(r);
  const callOk = !!(r.kind === 'private' && r.peer) && !!window.RoseCall;
  const ca = $('#chCallA'), cv = $('#chCallV');
  if (ca) ca.hidden = !callOk;
  if (cv) cv.hidden = !callOk;
}
function updateHeader() {
  const r = S.cur; if (!r) return;
  renderHeaderBase();
  const sub = $('#chSub');
  if (r.typing && r.typing.length) { sub.textContent = r.typing.join('، ') + ' در حال نوشتن…'; sub.className = 'typing'; return; }
  sub.className = '';
  if (r.kind === 'private' && r.peer) {
    sub.textContent = r.peer.online ? 'آنلاین' : 'آخرین بازدید: ' + fmtDT(r.peer.last_seen);
  } else {
    const n = S.info ? S.info.members.length : null;
    sub.textContent = (r.kind === 'channel' ? 'کانال' : 'گروه') + (n ? ' — ' + fa(n) + ' عضو' : '');
  }
}

/* ---------- بارگذاری/نمایش پیام‌ها ---------- */
function nearBottom() { const m = $('#msgs'); return m.scrollTop + m.clientHeight >= m.scrollHeight - 160; }
function scrollBottom(smooth) { const m = $('#msgs'); m.scrollTo({ top: m.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); }
function autoScroll() { if (nearBottom()) scrollBottom(true); }
function scrollToMsg(id) {
  const n = $(`#msgs .msg[data-id="${id}"]`);
  if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
  else if (id) toast('این پیام در بارگذاری اخیر نیست؛ از جست‌وجو پیدا کنید');
}
function markRead() {
  if (!S.cur || document.hidden) return;
  if (S.lastId > (S.cur.last_read || 0)) {
    S.cur.last_read = S.lastId;
    api(`rooms/${S.cur.id}/read`, 'POST', { mid: S.lastId }).catch(() => {});
    S.cur.unread = 0; renderRooms();
  }
}

function tickHTML(m) {
  const t = el('span', 'ticks');
  if (m.read) { t.classList.add('read'); t.innerHTML = icon('checks'); t.title = 'خوانده شد'; }
  else if (m.delivered) { t.innerHTML = icon('checks'); t.title = 'دریافت شد'; }
  else if (m.read_count != null) { t.innerHTML = icon('checks') + `<i>${fa(m.read_count)}/${fa(m.total)}</i>`; t.title = 'خوانده‌شده توسط اعضا'; }
  else { t.innerHTML = icon('check'); t.title = 'ارسال شد'; }
  return t;
}
function mediaHTML(m) {
  const url = '/api/file/' + m.file;
  if (m.mtype === 'image') {
    const img = new Image();
    img.className = 'm-img'; img.src = url; img.alt = m.filename || 'تصویر'; img.loading = 'lazy';
    img.onclick = () => lightbox(url);
    return img;
  }
  if (m.mtype === 'video') {
    const v = document.createElement('video');
    v.className = 'm-video'; v.src = url; v.controls = true; v.preload = 'metadata';
    return v;
  }
  if (m.mtype === 'audio') {
    const wrap = el('span');
    const lab = el('div', 'voicechip'); lab.innerHTML = icon('mic') + '<span>پیام صوتی</span>';
    const a = document.createElement('audio'); a.className = 'm-audio'; a.src = url; a.controls = true; a.preload = 'metadata';
    wrap.append(lab, a);
    return wrap;
  }
  const a = document.createElement('a');
  a.className = 'filechip'; a.href = url + '?dl=1'; a.download = m.filename || 'فایل';
  const fi = el('span', 'f-ic'); fi.innerHTML = icon(m.mtype === 'video' ? 'video' : m.mtype === 'image' ? 'image' : 'file');
  const fm = el('span'); fm.append(el('span', 'f-name', m.filename || 'فایل'), el('span', 'f-size', fmtSize(m.fsize)));
  a.append(fi, fm);
  return a;
}
function msgNode(m, prev) {
  const mine = m.user === S.me.id;
  const cont = prev && prev.user === m.user && sameDay(prev.created, m.created);
  const w = el('div', 'msg' + (mine ? ' mine' : '') + (cont ? '' : ' first') + ' new');
  w.dataset.id = m.id;
  if (!mine) { const avw = el('span', 'm-av'); avw.append(avEl(m.name, m.avatar, 'sm')); w.append(avw); }
  const b = el('div', 'bubble');
  const head = el('div', 'm-head');
  if (!mine && !cont) { const n = el('span', 'm-name', m.name); n.style.color = avColor(m.name); head.append(n); }
  if (m.pinned) { const p = el('span', 'pin-tag'); p.innerHTML = icon('pin') + '<span>سنجاق‌شده</span>'; head.append(p); }
  if (!head.children.length) head.remove(); else b.append(head);
  if (m.reply_to) {
    const q = el('div', 'quote');
    q.append(el('b', null, m.reply_name || ''), el('span', null, m.reply_body || ''));
    q.onclick = () => scrollToMsg(m.reply_to);
    b.append(q);
  }
  if (m.body) b.append(el('div', 'm-body', m.body));
  if (m.file) b.append(mediaHTML(m));
  const foot = el('div', 'm-foot');
  if (m.edited) foot.append(el('span', 'm-edited', 'ویرایش‌شده'));
  if (mine) foot.append(tickHTML(m));
  foot.append(el('span', 'm-time', fmtTime(m.created)));
  b.append(foot);
  w.append(b);
  const acts = actionsFor(m);
  if (acts.length) {
    const btn = el('button', 'iconbtn m-act');
    btn.innerHTML = icon('dots'); btn.title = 'گزینه‌ها';
    btn.onclick = e => { e.stopPropagation(); openMenu(e.clientX, e.clientY, acts); };
    w.append(btn);
    w.addEventListener('contextmenu', e => { e.preventDefault(); openMenu(e.clientX, e.clientY, acts); });
  }
  return w;
}
function msgBlock(m, prev) {
  const fr = document.createDocumentFragment();
  if (!prev || !sameDay(prev.created, m.created)) {
    const chip = el('div', 'date-chip', fmtDate(m.created));
    fr.append(chip);
    return { fr, node: msgNode(m, null) };
  }
  return { fr, node: msgNode(m, prev) };
}
function renderMsgs() {
  const box = $('#msgs');
  box.replaceChildren();
  if (S.msgs.length >= 200) {
    const b = el('button', 'load-older', 'نمایش پیام‌های قدیمی‌تر');
    b.onclick = loadOlder;
    box.append(b);
  }
  let prev = null;
  for (const m of S.msgs) {
    const { fr, node } = msgBlock(m, prev);
    fr.append(node); box.append(fr);
    prev = m;
  }
}
async function loadOlder() {
  if (!S.cur) return;
  try {
    const older = await api(`rooms/${S.cur.id}/messages?before=${S.oldest}&limit=200`);
    if (!older.length) { toast('پیام قدیمی‌تری نیست'); return; }
    const m = $('#msgs'), h = m.scrollHeight, st = m.scrollTop;
    S.msgs = [...older, ...S.msgs];
    S.oldest = older[0].id;
    renderMsgs();
    m.scrollTop = m.scrollHeight - h + st;
  } catch (e) { toast(e.message, true); }
}
function appendMsg(m) {
  const prev = S.msgs.length >= 2 ? S.msgs[S.msgs.length - 2] : null;
  const { fr, node } = msgBlock(m, prev);
  fr.append(node);
  $('#msgs').append(fr);
}
async function postMsg(fd) {
  const m = await api(`rooms/${S.cur.id}/messages`, 'POST', fd);
  S.msgs.push(m);
  S.lastId = Math.max(S.lastId, m.id);
  appendMsg(m);
  scrollBottom(true);
  S.cur.last_read = m.id;
}

/* ---------- پین‌ها ---------- */
function renderPinned(list) {
  const bar = $('#pinnedBar');
  if (!list || !list.length) { bar.hidden = true; bar.onclick = null; return; }
  const p = list[0];
  bar.replaceChildren();
  bar.innerHTML = icon('pin');
  bar.append(el('span', 'p-body', (p.name ? p.name + ': ' : '') + (p.body || p.filename || '')));
  if (canManageRoom()) {
    const up = el('button', 'p-unpin', 'برداشتن سنجاق');
    up.onclick = async e => { e.stopPropagation(); await pinMsg(p); };
    bar.append(up);
  }
  bar.hidden = false;
  bar.onclick = () => scrollToMsg(p.id);
}
async function pinMsg(m) {
  try {
    const res = await api(`messages/${m.id}/pin`, 'POST', {});
    m.pinned = res.pinned;
    const info = await api('rooms/' + S.cur.id);
    S.info = info; renderPinned(info.pinned); renderMsgs();
    toast(res.pinned ? 'پیام سنجاق شد' : 'سنجاق برداشته شد');
  } catch (e) { toast(e.message, true); }
}

/* ================= منوی گزینه‌ها ================= */
let menuOpen = null;
function openMenu(x, y, items) {
  closeMenu();
  const m = $('#ctxMenu');
  m.replaceChildren();
  for (const it of items) {
    const b = el('button', it[4] || '');
    b.innerHTML = icon(it[1]);
    b.append(el('span', null, it[2]));
    b.onclick = e => { e.stopPropagation(); closeMenu(); it[3](); };
    m.append(b);
  }
  m.hidden = false;
  const r = m.getBoundingClientRect();
  m.style.left = Math.min(x, innerWidth - r.width - 12) + 'px';
  m.style.top = Math.min(y, innerHeight - r.height - 12) + 'px';
  menuOpen = m;
}
function closeMenu() { if (menuOpen) { menuOpen.hidden = true; menuOpen = null; } }
document.addEventListener('click', closeMenu);
addEventListener('scroll', closeMenu, true);
addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeEmoji(); } });

function actionsFor(m) {
  const act = [];
  if (canPost(S.cur)) act.push(['reply', 'reply', 'پاسخ', () => setReply(m)]);
  if (m.body) act.push(['copy', 'file', 'کپی متن', () => copyText(m.body)]);
  if (canPost(S.cur)) act.push(['fwd', 'forward', 'فوروارد', () => openForward(m)]);
  if (canManageRoom()) act.push(['pin', 'pin', m.pinned ? 'برداشتن سنجاق' : 'سنجاق کردن', () => pinMsg(m)]);
  if (m.user === S.me.id && m.body) act.push(['edit', 'edit', 'ویرایش', () => setEdit(m)]);
  if (m.user === S.me.id || canManageRoom()) act.push(['del', 'trash', 'حذف', () => delMsg(m), 'danger']);
  return act;
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('متن کپی شد'); }
  catch (_) { toast('کپی ممکن نشد', true); }
}
async function delMsg(m) {
  if (!confirm('این پیام حذف شود؟')) return;
  try {
    await api('messages/' + m.id, 'DELETE');
    S.msgs = S.msgs.filter(x => x.id !== m.id);
    renderMsgs();
    const info = await api('rooms/' + S.cur.id); S.info = info; renderPinned(info.pinned);
  } catch (e) { toast(e.message, true); }
}

/* ================= آهنگر (ارسال) ================= */
const bodyBox = $('#body');
function autoResize() { bodyBox.style.height = 'auto'; bodyBox.style.height = Math.min(bodyBox.scrollHeight, 120) + 'px'; }
bodyBox.addEventListener('input', () => {
  autoResize();
  const now = Date.now();
  if (S.cur && now - S.typingSent > 3000) {
    S.typingSent = now;
    api(`rooms/${S.cur.id}/typing`, 'POST', {}).catch(() => {});
  }
});
bodyBox.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && innerWidth > 820) { e.preventDefault(); $('#composer').requestSubmit(); }
});
bodyBox.addEventListener('paste', e => {
  if (e.clipboardData && e.clipboardData.files.length) { e.preventDefault(); addFiles(e.clipboardData.files); }
});
$('#msgs').addEventListener('dragover', e => e.preventDefault());
$('#msgs').addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });

$('#composer').addEventListener('submit', async e => {
  e.preventDefault();
  const txt = bodyBox.value.trim();
  try {
    if (S.editing) {
      if (!txt) return;
      await api('messages/' + S.editing.id, 'PUT', { body: txt });
      const m = S.msgs.find(x => x.id === S.editing.id);
      if (m) { m.body = txt; m.edited = true; }
      clearComposeState(); bodyBox.value = ''; autoResize(); renderMsgs();
      return;
    }
    if (!S.cur) return;
    if (S.voice) {
      const fd = new FormData();
      fd.append('body', txt);
      fd.append('file', S.voice, 'voice-' + Date.now() + '.webm');
      S.voice = null;
      await postMsg(fd);
    } else if (S.pending.length) {
      for (let i = 0; i < S.pending.length; i++) {
        const fd = new FormData();
        if (i === 0 && txt) fd.append('body', txt);
        fd.append('file', S.pending[i]);
        await postMsg(fd);
      }
      S.pending = [];
    } else if (txt) {
      const fd = new FormData();
      fd.append('body', txt);
      await postMsg(fd);
    } else return;
    bodyBox.value = ''; autoResize(); renderChips();
  } catch (err) { toast(err.message, true); }
});
function setReply(m) { S.editing = null; $('#editBar').hidden = true; S.reply = m; $('#replyName').textContent = 'پاسخ به ' + m.name; $('#replyText').textContent = m.body || ('فایل: ' + (m.filename || '')); $('#replyBar').hidden = false; bodyBox.focus(); }
function setEdit(m) { S.reply = null; $('#replyBar').hidden = true; S.editing = m; $('#editBar').hidden = false; bodyBox.value = m.body; autoResize(); bodyBox.focus(); }
function clearComposeState() { S.reply = null; S.editing = null; $('#replyBar').hidden = true; $('#editBar').hidden = true; }
$('#replyCancel').onclick = () => { S.reply = null; $('#replyBar').hidden = true; };
$('#editCancel').onclick = () => { S.editing = null; $('#editBar').hidden = true; bodyBox.value = ''; autoResize(); };

/* ---------- پیوست فایل ---------- */
$('#attachBtn').onclick = () => $('#fileInput').click();
$('#fileInput').addEventListener('change', () => { addFiles($('#fileInput').files); $('#fileInput').value = ''; });
function addFiles(list) {
  for (const f of list) {
    if (f.size > 100 * 1024 * 1024) { toast('«' + f.name + '» بزرگ‌تر از ۱۰۰ مگابایت است', true); continue; }
    S.pending.push(f);
  }
  renderChips();
}
function renderChips() {
  const box = $('#pendingChips');
  box.replaceChildren();
  if (S.voice) {
    const c = el('div', 'pchip');
    const ic = el('span', 'f-ic'); ic.style.cssText = 'width:34px;height:34px;border-radius:9px;background:var(--rose-l);color:var(--rose-d);display:flex;align-items:center;justify-content:center';
    ic.innerHTML = icon('mic');
    const t = el('span'); t.append(el('span', 'p-name', 'پیام صوتی'), el('span', 'p-sub', fmtSize(S.voice.size)));
    const x = el('button', 'iconbtn'); x.innerHTML = icon('x'); x.type = 'button';
    x.onclick = () => { S.voice = null; renderChips(); };
    c.append(ic, t, x); box.append(c);
  }
  for (const [i, f] of S.pending.entries()) {
    const c = el('div', 'pchip');
    if ((f.type || '').startsWith('image/')) {
      const img = new Image(); img.src = URL.createObjectURL(f); c.append(img);
    } else {
      const ic = el('span', 'f-ic'); ic.style.cssText = 'width:34px;height:34px;border-radius:9px;background:var(--rose-l);color:var(--rose-d);display:flex;align-items:center;justify-content:center';
      ic.innerHTML = icon((f.type || '').startsWith('video/') ? 'video' : 'file');
      c.append(ic);
    }
    const t = el('span'); t.append(el('span', 'p-name', f.name), el('span', 'p-sub', fmtSize(f.size)));
    const x = el('button', 'iconbtn'); x.innerHTML = icon('x'); x.type = 'button';
    x.onclick = () => { S.pending.splice(i, 1); renderChips(); };
    c.append(t, x); box.append(c);
  }
}

/* ---------- ضبط صوت ---------- */
$('#micBtn').onclick = recToggle;
$('#recStop').onclick = () => { if (S.rec && S.rec.state === 'recording') { S.recCanceled = false; S.rec.stop(); } };
$('#recCancel').onclick = () => { if (S.rec && S.rec.state === 'recording') { S.recCanceled = true; S.rec.stop(); $('#recBar').hidden = true; $('#composer').hidden = false; } };
async function recToggle() {
  if (S.rec && S.rec.state === 'recording') { S.recCanceled = false; S.rec.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const rec = new MediaRecorder(stream);
    S.rec = rec; S.recCanceled = false;
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      clearInterval(S.recTimer);
      $('#recBar').hidden = true; $('#composer').hidden = false;
      if (!S.recCanceled && chunks.length) {
        S.voice = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        renderChips();
      }
      S.rec = null;
    };
    rec.start();
    $('#composer').hidden = true; $('#recBar').hidden = false;
    const t0 = Date.now();
    const tick = () => { const s = Math.floor((Date.now() - t0) / 1000); $('#recTime').textContent = fa(Math.floor(s / 60)) + ':' + fa(pad2(s % 60)); };
    tick(); S.recTimer = setInterval(tick, 300);
  } catch (e) {
    toast('ضبط صدا نیازمند HTTPS (یا localhost) و مجوز میکروفون است', true);
  }
}

/* ---------- ایموجی ---------- */
const EMOJIS = ['😀','😂','🤣','😊','😍','😘','😎','🤝','👍','🙏','👏','💪','🌹','❤️','🔥','✨','🎉','🥰','☕','🌺','🌸','🍀','⭐','☀️','🌙','☔','📝','📌','📎','✅','❌','⏰','📅','💡','📢','📞','💻','📊','📈','🗂️','📁','🖼️','🎵','🎧','⚠️','🚫','🤔','😴'];
function buildEmoji() {
  const p = $('#emojiPop');
  p.replaceChildren();
  for (const e of EMOJIS) {
    const b = el('button', null, e);
    b.type = 'button';
    b.onclick = ev => {
      ev.stopPropagation();
      const s = bodyBox.selectionStart || bodyBox.value.length;
      bodyBox.value = bodyBox.value.slice(0, s) + e + bodyBox.value.slice(bodyBox.selectionEnd || s);
      bodyBox.focus(); bodyBox.selectionStart = s + e.length;
      closeEmoji();
    };
    p.append(b);
  }
}
function closeEmoji() { $('#emojiPop').hidden = true; }
$('#emojiBtn').onclick = e => {
  e.stopPropagation();
  const p = $('#emojiPop');
  if (!p.hidden) { closeEmoji(); return; }
  buildEmoji();
  const r = $('#emojiBtn').getBoundingClientRect();
  p.style.bottom = (innerHeight - r.top + 10) + 'px';
  p.style.left = Math.min(r.left, innerWidth - 330) + 'px';
  p.style.top = 'auto';
  p.hidden = false;
};
document.addEventListener('click', e => { if (!$('#emojiPop').contains(e.target) && e.target !== $('#emojiBtn')) closeEmoji(); });

/* ================= پنل اعضا ================= */
function closeMembers() { $('#membersPanel').hidden = true; }
$('#mpClose').onclick = closeMembers;
$('#chInfo').onclick = () => {
  const p = $('#membersPanel');
  p.hidden = !p.hidden;
  if (!p.hidden) renderMembersPanel();
};
function renderMembersPanel() {
  const info = S.info, box = $('#mpBody');
  if (!info) return;
  box.replaceChildren();
  $('#mpTitle').textContent = info.kind === 'private' ? 'اطلاعات مخاطب' : (info.kind === 'channel' ? 'مشترکان کانال' : 'اعضای گروه');
  if (info.kind === 'private') {
    const peer = info.members.find(m => m.id !== S.me.id) || { name: roomName(S.cur), avatar: null };
    const pb = el('div', 'peer-box');
    pb.append(avEl(peer.name, peer.avatar, 'lg'), el('b', null, peer.name));
    const pr = S.cur.peer;
    pb.append(el('small', null, pr ? (pr.online ? 'آنلاین' : 'آخرین بازدید: ' + fmtDT(pr.last_seen)) : ''));
    box.append(pb);
  } else {
    const ms = [...info.members].sort((a, b) => (b.id === info.owner) - (a.id === info.owner) || (b.role === 'admin') - (a.role === 'admin') || a.name.localeCompare(b.name, 'fa'));
    for (const m of ms) {
      const row = el('div', 'mp-row');
      const avw = el('span', 'r-av'); avw.append(avEl(m.name, m.avatar, 'md')); avw.append(el('span', 'dot' + (m.online ? ' on' : '')));
      const main = el('div', 'r-main');
      const nm = el('div', 'r-name'); nm.append(el('span', null, m.name));
      if (m.id === info.owner) nm.append(el('span', 'role-tag own', 'مالک'));
      else if (m.role === 'admin') nm.append(el('span', 'role-tag', 'مدیر'));
      if (m.is_admin && m.id !== info.owner) nm.append(el('span', 'role-tag', 'مدیر سامانه'));
      main.append(nm, el('div', 'r-sub', m.unit_name || (m.online ? 'آنلاین' : '')));
      row.append(avw, main);
      if (info.manage && m.id !== info.owner && m.id !== S.me.id) {
        const acts = el('div', 'mp-actions');
        const rb = el('button', 'iconbtn');
        rb.innerHTML = icon('shield');
        rb.title = m.role === 'admin' ? 'سلب مدیریت' : 'ارتقا به مدیر';
        rb.onclick = async () => {
          try {
            await api(`rooms/${S.cur.id}/role`, 'POST', { user: m.id, role: m.role === 'admin' ? 'member' : 'admin' });
            await refreshInfo(); renderMembersPanel();
          } catch (e) { toast(e.message, true); }
        };
        acts.append(rb);
        const db = el('button', 'iconbtn danger');
        db.innerHTML = icon('userminus'); db.title = 'حذف از گروه';
        db.onclick = async () => {
          if (!confirm('«' + m.name + '» از این گفتگو حذف شود؟')) return;
          try {
            await api(`rooms/${S.cur.id}/members/${m.id}`, 'DELETE');
            await refreshInfo(); renderMembersPanel(); syncTick();
          } catch (e) { toast(e.message, true); }
        };
        acts.append(db);
        row.append(acts);
      } else if (m.id === S.me.id && info.kind !== 'private') {
        const acts = el('div', 'mp-actions');
        const lb = el('button', 'iconbtn danger');
        lb.innerHTML = icon('logout'); lb.title = 'خروج از گفتگو';
        lb.onclick = leaveRoom;
        acts.append(lb);
        row.append(acts);
      }
      box.append(row);
    }
  }
  $('#mpAdd').hidden = !(info.manage && info.kind !== 'private');
}
async function refreshInfo() {
  if (!S.cur) return;
  S.info = await api('rooms/' + S.cur.id);
  renderPinned(S.info.pinned);
  updateHeader();
}
async function leaveRoom() {
  if (!confirm('از این گفتگو خارج می‌شوید؟')) return;
  try {
    await api(`rooms/${S.cur.id}/members/${S.me.id}`, 'DELETE');
    S.cur = null; S.info = null;
    $('#msgs').hidden = true; $('#composerWrap').hidden = true; $('#pinnedBar').hidden = true;
    $('#welcome').hidden = false;
    $('#chatHeader').classList.add('empty');
    $('#chInfo').hidden = true; $('#chMore').hidden = true;
    $('#chName').textContent = 'پیام‌رسان رز';
    $('#chSub').textContent = 'برای شروع یک گفتگو را انتخاب کنید';
    $('#chAv').replaceChildren();
    closeMembers();
    await syncTick();
  } catch (e) { toast(e.message, true); }
}
$('#mpAdd').onclick = async () => {
  const info = S.info;
  const inRoom = new Set(info.members.map(m => m.id));
  const rest = S.users.filter(u => u.active && !inRoom.has(u.id));
  if (!rest.length) { toast('همه کاربران عضو هستند'); return; }
  openPick('افزودن عضو', rest, async ids => {
    try {
      await api(`rooms/${S.cur.id}/members`, 'POST', { ids });
      await refreshInfo(); renderMembersPanel(); syncTick();
      toast('اعضا اضافه شدند');
    } catch (e) { toast(e.message, true); }
  });
};

/* ================= منوی سربرگ اتاق ================= */
$('#chMore').onclick = e => {
  e.stopPropagation();
  const info = S.info;
  const items = [];
  if (info && info.kind !== 'private' && info.manage) items.push(['rn', 'edit', 'تغییر نام', renameRoom]);
  if (info && info.kind !== 'private' && info.manage) items.push(['am', 'userplus', 'افزودن عضو', () => $('#mpAdd').click()]);
  if (S.cur.kind !== 'private') items.push(['lv', 'logout', 'خروج از گفتگو', leaveRoom, 'danger']);
  if (S.cur.owner === S.me.id || S.me.is_admin) items.push(['rd', 'trash', 'حذف گفتگو', deleteRoom, 'danger']);
  if (items.length) openMenu(e.clientX, e.clientY, items);
};
async function renameRoom() {
  const name = prompt('نام تازه:', S.cur.name);
  if (name === null) return;
  if (!name.trim()) { toast('نام نمی‌تواند خالی باشد', true); return; }
  try {
    await api(`rooms/${S.cur.id}`, 'PUT', { name: name.trim() });
    await syncTick();
    const cr = S.rooms.find(x => x.id === S.cur.id);
    if (cr) S.cur = cr;
    updateHeader();
  } catch (e) { toast(e.message, true); }
}
async function deleteRoom() {
  if (!confirm('این گفتگو و همه پیام‌هایش برای همیشه حذف شود؟')) return;
  try {
    await api('rooms/' + S.cur.id, 'DELETE');
    S.cur = null; S.info = null;
    $('#msgs').hidden = true; $('#composerWrap').hidden = true; $('#pinnedBar').hidden = true;
    $('#welcome').hidden = false;
    $('#chatHeader').classList.add('empty');
    $('#chInfo').hidden = true; $('#chMore').hidden = true;
    $('#chName').textContent = 'پیام‌رسان رز';
    $('#chSub').textContent = 'برای شروع یک گفتگو را انتخاب کنید';
    $('#chAv').replaceChildren();
    closeMembers();
    await syncTick();
    toast('گفتگو حذف شد');
  } catch (e) { toast(e.message, true); }
}

/* ================= مودال‌ها ================= */
function openM(id) { $('#' + id).hidden = false; }
function closeM(id) { $('#' + id).hidden = true; }
document.querySelectorAll('.overlay').forEach(ov => {
  if (ov.id === 'lightbox') return;
  ov.addEventListener('click', e => { if (e.target === ov) ov.hidden = true; });
  ov.querySelectorAll('.m-close').forEach(b => b.onclick = () => { ov.hidden = true; });
});
function lightbox(src) { $('#lbImg').src = src; $('#lightbox').hidden = false; }
$('#lightbox').onclick = () => { $('#lightbox').hidden = true; };

/* ---------- انتخابگر عمومی (چک‌باکس) ---------- */
function openPick(title, users, cb) {
  S.pickCb = cb;
  const ov = $('#mPick');
  ov.querySelector('strong').textContent = title;
  const list = $('#pkList');
  list.replaceChildren();
  for (const u of users) {
    const row = el('label', 'row');
    const avw = el('span', 'r-av'); avw.append(avEl(u.name, u.avatar, 'md')); avw.append(el('span', 'dot' + (u.online ? ' on' : '')));
    const main = el('div', 'r-main'); main.append(el('div', 'r-name', u.name), el('div', 'r-sub', u.unit_name || ''));
    const cbx = document.createElement('input'); cbx.type = 'checkbox'; cbx.value = u.id;
    row.append(avw, main, cbx);
    list.append(row);
  }
  ov.hidden = false;
}
$('#pkMake').onclick = () => {
  const ids = [...$('#pkList').querySelectorAll('input:checked')].map(i => Number(i.value));
  $('#mPick').hidden = true;
  if (ids.length && S.pickCb) S.pickCb(ids);
};

/* ---------- گفت‌وگوی خصوصی جدید ---------- */
$('#btnProfile').onclick = () => openProfile();
$('#welcomeNew').onclick = () => openNewChat();
function openNewChat() {
  $('#ncSearch').value = '';
  $('#ncPhone').value = '';
  $('#phoneResult').hidden = true;
  renderNC('');
  openM('mNewChat');
}
function renderNC(q) {
  const list = $('#ncList');
  list.replaceChildren();
  const us = S.users.filter(u => u.active && u.id !== S.me.id && (!q || u.name.includes(q)));
  if (!us.length) list.append(el('div', 'empty-list', 'مخاطبی یافت نشد'));
  for (const u of us) {
    const row = el('button', 'row');
    const avw = el('span', 'r-av'); avw.append(avEl(u.name, u.avatar, 'md')); avw.append(el('span', 'dot' + (u.online ? ' on' : '')));
    const main = el('div', 'r-main'); main.append(el('div', 'r-name', u.name), el('div', 'r-sub', u.unit_name || ''));
    row.append(avw, main);
    row.onclick = () => { closeM('mNewChat'); privateRoom(u.id); };
    list.append(row);
  }
}
$('#phoneLookup').onsubmit = async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button');
  const result = $('#phoneResult');
  submit.disabled = true;
  result.hidden = false;
  result.textContent = 'در حال جست‌وجو…';
  try {
    const user = await api('contacts/phone', 'POST', { phone: $('#ncPhone').value.trim() });
    const open = el('button', 'btn primary', 'شروع گفتگو با ' + user.name);
    open.type = 'button';
    open.onclick = () => { closeM('mNewChat'); privateRoom(user.id); };
    result.replaceChildren(open);
  } catch (err) {
    result.textContent = err.message;
  } finally {
    submit.disabled = false;
  }
};
$('#ncSearch').addEventListener('input', e => renderNC(e.target.value.trim()));

/* ---------- ساخت گروه/کانال ---------- */
$('#btnNewChat').onclick = () => openNewChat();
$('#btnNewGroup').onclick = () => openNewGroup();
$('#chBack').onclick = () => $('#sidebar').classList.add('open');
$('#chatPane').addEventListener('click', e => {
  if (innerWidth <= 820 && $('#sidebar').classList.contains('open') && !$('#sidebar').contains(e.target)) {
    $('#sidebar').classList.remove('open');
  }
});
function openNewGroup() {
  $('#ngName').value = '';
  $('#ngKind').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === 'group'));
  renderNG('');
  openM('mNewGroup');
}
function renderNG(q) {
  const list = $('#ngList');
  list.replaceChildren();
  const us = S.users.filter(u => u.active && u.id !== S.me.id && (!q || u.name.includes(q)));
  if (!us.length) list.append(el('div', 'empty-list', 'کاربری برای افزودن نیست'));
  for (const u of us) {
    const row = el('label', 'row');
    const avw = el('span', 'r-av'); avw.append(avEl(u.name, u.avatar, 'md'));
    const main = el('div', 'r-main'); main.append(el('div', 'r-name', u.name), el('div', 'r-sub', u.unit_name || ''));
    const cbx = document.createElement('input'); cbx.type = 'checkbox'; cbx.value = u.id;
    row.append(avw, main, cbx);
    list.append(row);
  }
}
$('#ngKind').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  $('#ngKind').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
});
$('#ngSearch') && $('#ngSearch').addEventListener('input', e => renderNG(e.target.value.trim()));
$('#ngMake').onclick = async () => {
  const kind = $('#ngKind').querySelector('.on').dataset.k;
  const name = $('#ngName').value.trim();
  const ids = [...$('#ngList').querySelectorAll('input:checked')].map(i => Number(i.value));
  if (!name) { toast('نام را وارد کنید', true); return; }
  try {
    const res = await api('rooms', 'POST', { kind, name, members: ids });
    closeM('mNewGroup');
    await syncTick();
    openRoom(res.id);
    toast(kind === 'channel' ? 'کانال ساخته شد' : 'گروه ساخته شد');
  } catch (e) { toast(e.message, true); }
};

/* ---------- فوروارد ---------- */
function openForward(m) {
  S.fwdMsg = m;
  renderFW('');
  openM('mForward');
}
function renderFW(q) {
  const list = $('#fwList');
  list.replaceChildren();
  const rs = S.rooms.filter(r => canPost(r) && (!q || roomName(r).includes(q)));
  if (!rs.length) list.append(el('div', 'empty-list', 'گفتگوی مجازی برای فوروارد نیست'));
  for (const r of rs) {
    const row = el('button', 'row');
    const avw = el('span', 'r-av');
    if (r.kind === 'private' && r.peer) avw.append(avEl(r.peer.name, r.peer.avatar, 'md')); else avw.append(groupAv('md'));
    const main = el('div', 'r-main'); main.append(el('div', 'r-name', roomName(r)), el('div', 'r-sub', { group: 'گروه', channel: 'کانال', private: 'گفت‌وگوی خصوصی' }[r.kind]));
    row.append(avw, main);
    row.onclick = async () => {
      try {
        await api(`messages/${S.fwdMsg.id}/forward`, 'POST', { room: r.id });
        closeM('mForward');
        toast('فوروارد شد');
        if (S.cur && S.cur.id === r.id) roomTick();
      } catch (e) { toast(e.message, true); }
    };
    list.append(row);
  }
}
$('#fwSearch').addEventListener('input', e => renderFW(e.target.value.trim()));

/* ---------- پروفایل ---------- */
let pfAvatarFile = null;
function openProfile() {
  pfAvatarFile = null;
  $('#pfAvatar').replaceChildren(avEl(S.me.name, S.me.avatar, 'lg'));
  $('#pfName').value = S.me.name;
  $('#pfCur').value = ''; $('#pfNew').value = ''; $('#pfNew2').value = '';
  $('#pfSound').checked = localStorage.getItem('rose_sound') !== '0';
  openM('mProfile');
}
$('#pfAvatarBtn').onclick = () => $('#pfAvatarInput').click();
$('#pfAvatarInput').addEventListener('change', () => {
  const f = $('#pfAvatarInput').files[0];
  if (!f) return;
  pfAvatarFile = f;
  const d = avEl(S.me.name, null, 'lg');
  const img = new Image(); img.src = URL.createObjectURL(f);
  d.replaceChildren(img);
  $('#pfAvatar').replaceChildren(d);
});
$('#pfSave').onclick = async () => {
  const fd = new FormData();
  fd.append('name', $('#pfName').value.trim());
  if (pfAvatarFile) fd.append('avatar', pfAvatarFile);
  try {
    await api('me', 'POST', fd);
    const u = await api('me');
    S.me = { ...S.me, ...u };
    $('#chipAv').replaceChildren(avEl(S.me.name, S.me.avatar, 'sm'));
    $('#chipName').textContent = S.me.name;
    closeM('mProfile');
    toast('پروفایل به‌روزرسانی شد');
  } catch (e) { toast(e.message, true); }
};
$('#pfPassSave').onclick = async () => {
  const cur = $('#pfCur').value, nw = $('#pfNew').value, n2 = $('#pfNew2').value;
  if (nw !== n2) { toast('تکرار رمز مطابقت ندارد', true); return; }
  const fd = new FormData();
  if (cur) fd.append('current_password', cur);
  fd.append('new_password', nw);
  try {
    await api('me', 'POST', fd);
    $('#pfCur').value = ''; $('#pfNew').value = ''; $('#pfNew2').value = '';
    toast('رمز عبور تغییر یافت');
  } catch (e) { toast(e.message, true); }
};
$('#pfSound').addEventListener('change', e => {
  localStorage.setItem('rose_sound', e.target.checked ? '1' : '0');
});

/* ---------- خروج ---------- */
$('#btnLogout').onclick = async () => {
  if (!confirm('از حساب خود خارج می‌شوید؟')) return;
  try { await api('logout', 'POST', {}); } catch (_) {}
  location.reload();
};

/* ---------- پنل مدیریت ---------- */
$('#btnAdmin').onclick = () => { S.adTab = 'stats'; setAdTab(); openM('mAdmin'); renderAd(); };
$('#adTabs').addEventListener('click', e => {
  const b = e.target.closest('.tab');
  if (!b) return;
  S.adTab = b.dataset.t;
  setAdTab();
  renderAd();
});
function setAdTab() {
  $('#adTabs').querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === S.adTab));
}
async function renderAd() {
  const body = $('#adBody');
  body.replaceChildren();
  body.append(el('p', 'hint', 'در حال بارگذاری…'));
  try {
    if (S.adTab === 'stats') await adStats(body);
    else if (S.adTab === 'users') await adUsers(body);
    else if (S.adTab === 'units') await adUnits(body);
    else if (S.adTab === 'rooms') await adRooms(body);
    else if (S.adTab === 'backup') adBackup(body);
  } catch (e) { body.replaceChildren(el('p', 'err', e.message)); }
}
async function adStats(body) {
  const s = await api('admin/stats');
  body.replaceChildren();
  const g = el('div', 'stat-grid');
  const items = [
    ['کاربران', fa(s.users)], ['کاربران فعال', fa(s.active)], ['آنلاین сейчас', fa(s.online)],
    ['کل پیام‌ها', fa(s.messages)], ['فایل‌ها', fa(s.files)],
    ['گفت‌وگوی خصوصی', fa(s.rooms.private)], ['گروه‌ها', fa(s.rooms.group)], ['کانال‌ها', fa(s.rooms.channel)],
    ['فضای ذخیره‌سازی', fmtSize(s.storage)]
  ];
  for (const [k, v] of items) {
    const c = el('div', 'stat');
    c.append(el('b', null, v), el('span', null, k));
    g.append(c);
  }
  body.append(g);
}
async function adUsers(body) {
  const [us, un] = await Promise.all([api('users'), api('units')]);
  body.replaceChildren();
  const form = el('div', 'ad-form');
  const lbl = (txt, node) => { const l = el('label'); l.append(el('span', null, txt), node); return l; };
  const fN = document.createElement('input'); fN.placeholder = 'نام کاربری';
  const fPhone = document.createElement('input'); fPhone.type = 'tel'; fPhone.dir = 'ltr';
  const fP = document.createElement('input'); fP.type = 'password'; fP.placeholder = 'رمز اولیه';
  const fU = document.createElement('select');
  fU.append(new Option('بدون واحد', ''));
  for (const u of un) fU.append(new Option(u.name, u.id));
  const fA = document.createElement('input'); fA.type = 'checkbox'; fA.title = 'مدیر سامانه';
  const btn = el('button', 'btn primary', 'ایجاد کاربر');
  btn.onclick = async () => {
    try {
      await api('users', 'POST', { name: fN.value.trim(), password: fP.value, phone: fPhone.value.trim(), unit: fU.value ? Number(fU.value) : null, is_admin: fA.checked });
      toast('کاربر ساخته شد');
      renderAd();
    } catch (e) { toast(e.message, true); }
  };
  form.append(lbl('نام کاربری', fN), lbl('رمز اولیه', fP), lbl('شماره موبایل', fPhone), lbl('واحد سازمانی', fU), lbl('مدیر', fA), btn);
  body.append(form);
  const t = el('table', 'ad-t');
  const thead = el('thead');
  thead.innerHTML = '<tr><th>کاربر</th><th>واحد</th><th>مدیر</th><th>فعال</th><th>وضعیت</th><th>عملیات</th></tr>';
  t.append(thead);
  const tb = el('tbody');
  for (const u of us) {
    const tr = el('tr');
    const tdN = el('td');
    const uw = el('div', 'ad-u');
    uw.append(avEl(u.name, u.avatar, 'sm'), el('span', null, u.name));
    if (u.id === S.me.id) uw.append(el('span', 'role-tag', 'شما'));
    tdN.append(uw);
    const tdU = el('td');
    const sel = document.createElement('select');
    sel.append(new Option('بدون واحد', ''));
    for (const x of un) sel.append(new Option(x.name, x.id));
    sel.value = u.unit || '';
    if (u.id !== S.me.id) sel.onchange = () => api('users/' + u.id, 'PUT', { unit: sel.value ? Number(sel.value) : null }).then(() => toast('واحد ثبت شد')).catch(e => toast(e.message, true));
    else sel.disabled = true;
    tdU.append(sel);
    const tdA = el('td');
    const cbA = document.createElement('input'); cbA.type = 'checkbox'; cbA.checked = u.is_admin;
    if (u.id === S.me.id) cbA.disabled = true;
    else cbA.onchange = () => api('users/' + u.id, 'PUT', { is_admin: cbA.checked }).then(() => toast('ثبت شد')).catch(e => { toast(e.message, true); renderAd(); });
    tdA.append(cbA);
    const tdV = el('td');
    const cbV = document.createElement('input'); cbV.type = 'checkbox'; cbV.checked = u.active;
    if (u.id === S.me.id) cbV.disabled = true;
    else cbV.onchange = () => api('users/' + u.id, 'PUT', { active: cbV.checked }).then(() => toast('ثبت شد')).catch(e => { toast(e.message, true); renderAd(); });
    tdV.append(cbV);
    const tdS = el('td');
    const st = el('span', null, u.online ? 'آنلاین' : (u.active ? 'آفلاین' : 'غیرفعال'));
    st.style.color = u.online ? 'var(--ok)' : 'var(--mut)';
    tdS.append(st);
    const tdO = el('td');
    const acts = el('div', 't-act');
    const rp = el('button', 'iconbtn');
    rp.innerHTML = icon('settings'); rp.title = 'تعیین رمز تازه';
    rp.onclick = async () => {
      const pw = prompt('رمز تازه برای «' + u.name + '» (حداقل ۱۲ نویسه):');
      if (pw === null) return;
      try { await api('users/' + u.id, 'PUT', { password: pw }); toast('رمز تعیین شد'); }
      catch (e) { toast(e.message, true); }
    };
    acts.append(rp);
    const phone = el('button', 'iconbtn');
    phone.innerHTML = icon('phone');
    phone.title = 'ویرایش شماره موبایل';
    phone.setAttribute('aria-label', phone.title);
    phone.onclick = async () => {
      const value = prompt('شماره موبایل (خالی برای حذف)', u.phone || '');
      if (value === null) return;
      try {
        await api('users/' + u.id, 'PUT', { phone: value.trim() });
        toast('شماره ثبت شد');
        renderAd();
      } catch (err) { toast(err.message, true); }
    };
    acts.append(phone);
    const db = el('button', 'iconbtn danger');
    db.innerHTML = icon('trash'); db.title = 'حذف کاربر';
    db.onclick = async () => {
      if (!confirm('کاربر «' + u.name + '» حذف شود؟ (پیام‌های او باقی می‌ماند)')) return;
      try { await api('users/' + u.id, 'DELETE'); toast('کاربر حذف شد'); renderAd(); syncTick(); }
      catch (e) { toast(e.message, true); }
    };
    acts.append(db);
    tdO.append(acts);
    tr.append(tdN, tdU, tdA, tdV, tdS, tdO);
    tb.append(tr);
  }
  t.append(tb);
  body.append(t);
}
async function adUnits(body) {
  const un = await api('units');
  body.replaceChildren();
  const form = el('div', 'ad-form');
  const lbl = (txt, node) => { const l = el('label'); l.append(el('span', null, txt), node); return l; };
  const fN = document.createElement('input'); fN.placeholder = 'مثلاً: معاونت آموزش';
  const fK = document.createElement('select');
  fK.append(new Option('واحد ستادی', 'ho'), new Option('مرکز استانی', 'prov'));
  const btn = el('button', 'btn primary', 'افزودن واحد');
  btn.onclick = async () => {
    try {
      await api('units', 'POST', { name: fN.value.trim(), kind: fK.value });
      toast('واحد ساخته شد'); renderAd();
    } catch (e) { toast(e.message, true); }
  };
  form.append(lbl('نام واحد', fN), lbl('نوع', fK), btn);
  body.append(form);
  const t = el('table', 'ad-t');
  const thead = el('thead');
  thead.innerHTML = '<tr><th>نام واحد</th><th>نوع</th><th>تعداد کاربران</th><th>عملیات</th></tr>';
  t.append(thead);
  const tb = el('tbody');
  for (const u of un) {
    const tr = el('tr');
    tr.append(el('td', null, u.name), el('td', null, u.kind === 'ho' ? 'واحد ستادی' : 'مرکز استانی'), el('td', null, fa(u.n)));
    const tdO = el('td');
    const acts = el('div', 't-act');
    const rb = el('button', 'iconbtn');
    rb.innerHTML = icon('edit'); rb.title = 'تغییر نام';
    rb.onclick = async () => {
      const name = prompt('نام تازه:', u.name);
      if (name === null) return;
      try { await api('units/' + u.id, 'PUT', { name: name.trim() }); renderAd(); }
      catch (e) { toast(e.message, true); }
    };
    acts.append(rb);
    const db = el('button', 'iconbtn danger');
    db.innerHTML = icon('trash'); db.title = 'حذف واحد';
    db.onclick = async () => {
      if (!confirm('واحد «' + u.name + '» حذف شود؟')) return;
      try { await api('units/' + u.id, 'DELETE'); renderAd(); }
      catch (e) { toast(e.message, true); }
    };
    acts.append(db);
    tdO.append(acts);
    tr.append(tdO);
    tb.append(tr);
  }
  t.append(tb);
  body.append(t);
}
async function adRooms(body) {
  const rs = await api('admin/rooms');
  body.replaceChildren();
  const t = el('table', 'ad-t');
  const thead = el('thead');
  thead.innerHTML = '<tr><th>#</th><th>نام</th><th>نوع</th><th>مالک</th><th>اعضا</th><th>پیام‌ها</th><th>عملیات</th></tr>';
  t.append(thead);
  const tb = el('tbody');
  for (const r of rs) {
    const tr = el('tr');
    tr.append(
      el('td', null, fa(r.id)),
      el('td', null, r.name || '—'),
      el('td', null, { private: 'خصوصی', group: 'گروه', channel: 'کانال' }[r.kind]),
      el('td', null, r.owner_name || '—'),
      el('td', null, fa(r.nmem)),
      el('td', null, fa(r.nmsg))
    );
    const tdO = el('td');
    const acts = el('div', 't-act');
    const db = el('button', 'iconbtn danger');
    db.innerHTML = icon('trash'); db.title = 'حذف گفتگو';
    db.onclick = async () => {
      if (!confirm('گفتگو «' + (r.name || r.id) + '» و همه پیام‌هایش حذف شود؟')) return;
      try { await api('rooms/' + r.id, 'DELETE'); toast('حذف شد'); renderAd(); syncTick(); }
      catch (e) { toast(e.message, true); }
    };
    acts.append(db);
    tdO.append(acts);
    tr.append(tdO);
    tb.append(tr);
  }
  t.append(tb);
  body.append(t);
}
function adBackup(body) {
  body.replaceChildren();
  const box = el('div', 'backup-box');
  box.append(
    el('strong', null, 'نسخه پشتیبان کامل'),
    el('p', null, 'فایل ZIP شامل پایگاه داده (همه کاربران، گفتگوها و پیام‌ها) و همه فایل‌های ارسالی دانلود می‌شود. توصیه می‌شود به‌صورت منظم تهیه و در جای امن نگهداری شود.'),
    el('p', null, 'برای پشتیبان‌گیری خودکار روزانه می‌توانید از اسکریپت backup-rose.ps1 روی سرور استفاده کنید.')
  );
  const b = el('button', 'btn primary', 'دریافت نسخه پشتیبان (ZIP)');
  b.onclick = () => window.open('/api/admin/backup', '_blank');
  box.append(b);
  body.append(box);
}

/* ================= شروع ================= */
setInterval(() => { syncTick().catch(() => {}); }, 3500);
setInterval(() => { roomTick().catch(() => {}); }, 1300);

(async function boot() {
  try {
    const h = await fetch('/api/health').then(r => r.json());
    if (h.tekno_url && !h.fresh) {
      const loginLink = $('#teknoLogin');
      loginLink.href = h.tekno_url;
      loginLink.hidden = false;
      const homeLink = $('#teknoHome');
      homeLink.href = new URL(h.tekno_url).origin;
      homeLink.hidden = false;
    }
    if (h.fresh) { $('#loginForm').hidden = true; $('#setupForm').hidden = false; }
  } catch (_) {}
  try {
    const u = await api('me');
    enterApp(u);
  } catch (_) { /* ورود لازم است */ }
})();

