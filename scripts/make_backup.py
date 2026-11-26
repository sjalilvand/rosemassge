# -*- coding: utf-8 -*-
"""ابزار ساخت نسخه پشتیبان پیام‌رسان رز (پایگاه داده + فایل‌ها) در یک ZIP

استفاده:
    python make_backup.py -d backups -k 30
"""
import argparse
import os
import sqlite3
import time
import zipfile

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-d', '--dest', default='backups', help='پوشه خروجی')
    ap.add_argument('-k', '--keep', type=int, default=30, help='تعداد نسخه‌های نگهداری‌شده')
    args = ap.parse_args()

    data = os.getenv('DATA_DIR', 'data')
    db_path = os.path.join(data, 'rose.db')
    uploads = os.path.join(data, 'uploads')
    if not os.path.exists(db_path):
        raise SystemExit('پایگاه داده یافت نشد: ' + db_path)

    os.makedirs(args.dest, exist_ok=True)
    stamp = time.strftime('%Y-%m-%d_%H-%M-%S')
    out = os.path.join(args.dest, f'rose-backup-{stamp}.zip')

    tmpdb = db_path + f'.backup-{stamp}.tmp'
    src = sqlite3.connect(db_path)
    dst = sqlite3.connect(tmpdb)
    with dst:
        src.backup(dst)
    src.close()
    dst.close()

    n = 0
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(tmpdb, 'rose.db')
        if os.path.isdir(uploads):
            for f in sorted(os.listdir(uploads)):
                p = os.path.join(uploads, f)
                if os.path.isfile(p):
                    zf.write(p, f'uploads/{f}')
                    n += 1
    os.remove(tmpdb)
    size = os.path.getsize(out)

    # حذف نسخه‌های قدیمی
    olds = sorted((f for f in os.listdir(args.dest) if f.startswith('rose-backup-') and f.endswith('.zip')),
                  reverse=True)[args.keep:]
    for f in olds:
        try:
            os.remove(os.path.join(args.dest, f))
        except OSError:
            pass

    print(f'[OK] پشتیبان ساخته شد: {out} ({size / 1048576:.1f} MB، {n} فایل پیوست)')

if __name__ == '__main__':
    main()
