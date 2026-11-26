# پیام‌رسان رز | Rose Messenger

پیام‌رسان سازمانی تحت وب برای **شرکت مشاوره رز** — بدون داکر، فقط با Python روی ویندوز یا لینوکس اجرا می‌شود و از کامپیوتر، تبلت و تلفن همراه قابل استفاده است.

## امکانات

| بخش | امکانات |
| --- | --- |
| گفت‌وگوی خصوصی | چت دو‌نفره لحظه‌ای با جلوگیری از گفت‌وگوی تکراری |
| تماس | تماس صوتی و تصویری دونفره با WebRTC و پشتیبانی از TURN |
| موبایل | وب‌اپ نصب‌شدنی برای اندروید و iOS از طریق مرورگر |
| گروه‌ها | ساخت گروه، افزودن/حذف اعضا، تعیین چند مدیر، تغییر نام |
| کانال‌ها | اطلاعیه‌رسانی؛ فقط مدیران می‌توانند پیام بگذارند |
| تصویر و فیلم | ارسال، نمایش درون‌خطی تصویر و پخش ویدیو با کلیک برای بزرگ‌نمایی |
| پیام صوتی | ضبط مستقیم میکروفون در مرورگر و ارسال (نیازمند HTTPS) |
| فایل‌ها | Word، PDF، Excel و هر فایل تا ۱۰۰ مگابایت با نشان‌گر حجم |
| مدیریت پیام | پاسخ (Quote)، فوروارد، سنجاق کردن، ویرایش، حذف، کپی متن |
| وضعیت پیام | ارسال، دریافت و خوانده‌شدن (تیک و دو‌تیک) |
| کاربران | تصویر پروفایل، وضعیت آنلاین، آخرین بازدید، «در حال نوشتن…» و یافتن مخاطب با شماره موبایل ثبت‌شده توسط مدیر |
| جست‌وجو | جست‌وجوی کاربران، گفتگوها، متن پیام‌ها و نام فایل‌ها |
| اعلان‌ها | شمارنده نخوانده، زنگ جدید، اعلان مرورگر (Notification) |
| پنل مدیریت | ایجاد/ویرایش/غیرفعال‌سازی/حذف کاربر، مدیریت گروه‌ها و کانال‌ها، آمار، پشتیبان‌گیری |
| ساختار سازمانی | تعریف واحدهای ستادی و مراکز استانی و گروه‌بندی مخاطبین |
| امنیت | هش رمز، نشست امن + CSRF، محدودیت تلاش ورود، کنترل دسترسی فایل، پشتیبان‌گیری |

## معماری

- بک‌اند: **Python 3.10+ / Flask + SQLite** (بدون وابستگی به داکر)
- فرانت‌اند: HTML/CSS/JS خالص، راست‌به‌چپ — بدون مرحله build
- سرور تولید: **waitress** (سازگار با ویندوز) و در حالت HTTPS سرور داخلی Flask
- به‌روزرسانی لحظه‌ای: هم‌گام‌سازی افزایشی هر ۱٫۳ و ۳٫۵ ثانیه

## اجرای سریع (تست محلی)

```powershell
cd RoseMessenger
powershell -ExecutionPolicy Bypass -File powershell\run-rose.ps1
# سپس: http://localhost:8088
```

نخستین بار فرم «ایجاد حساب مدیر» نمایش داده می‌شود؛ نام کاربری و رمز (حداقل ۱۲ نویسه) را وارد کنید.

## استقرار کامل روی سرور ویندوز (بدون داکر)

روی سرور، PowerShell را به‌صورت Administrator باز کنید:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
Invoke-WebRequest "https://raw.githubusercontent.com/sjalilvand/rosemassge/main/powershell/deploy-rose.ps1" -OutFile deploy-rose.ps1
.\deploy-rose.ps1 -Action install
```

اسکریپت به‌ترتیب: نصب Python (در نبود آن)، دریافت سورس از گیت‌هاب، ساخت venv و نصب وابستگی‌ها، ساخت فایل `.env` با کلید امن، ساخت حساب مدیر، باز کردن پورت در فایروال، ساخت Task ویندوز برای اجرای خودکار پس از ری‌استارت، و راه‌اندازی سرویس.

سایر دستورها:

```powershell
.\deploy-rose.ps1 -Action status     # وضعیت سرویس
.\deploy-rose.ps1 -Action restart
.\deploy-rose.ps1 -Action stop
.\deploy-rose.ps1 -Action uninstall  # حذف کامل (داده‌ها می‌ماند)
```

پارامترهای مهم:

```powershell
.\deploy-rose.ps1 -Action install -Port 8088 -InstallDir C:\RoseMessenger -AdminUser admin
.\deploy-rose.ps1 -Action install -HTTPS   # اجرا با گواهی خودامضا (برای ضبط صوت روی LAN)
```

## HTTPS و ضبط پیام صوتی

مرورگرها اجازه دسترسی به میکروفون را فقط در **HTTPS یا localhost** می‌دهند:

- روی هر کاربر `localhost` ضبط صدا کار می‌کند.
- برای شبکه داخلی/اینترنت: `-HTTPS` را هنگام نصب بدهید؛ گواهی خودامضا ساخته می‌شود و سرویس روی همان پورت با HTTPS بالا می‌آید. بار نخست مرورگر هشدار گواهی می‌دهد (Advanced → Proceed) — برای حذف هشدار، گواهی `data\rose-cert.pem` را روی سیستم کاربران در Trusted Root نصب کنید.
- برای محیط عملیاتی پرترافیک، توصیه می‌شود یک Reverse Proxy استاندارد (IIS/Nginx/Caddy) با گواهی معتبر جلوی سرویس قرار گیرد.

## پشتیبان‌گیری

```powershell
powershell -ExecutionPolicy Bypass -File powershell\backup-rose.ps1            # یک‌باره
# زمان‌بندی روزانه ساعت ۲ بامداد:
schtasks /Create /TN "RoseBackup" /SC DAILY /ST 02:00 /RU SYSTEM /RL HIGHEST /F ^
  /TR "powershell -ExecutionPolicy Bypass -File C:\RoseMessenger\powershell\backup-rose.ps1"
```

خروجی ZIP (پایگاه داده + همه فایل‌ها) در `C:\RoseMessenger\backups` نگهداری می‌شود (۳۰ نسخه آخر). از پنل مدیریت → پشتیبان‌گیری هم می‌توان نسخه دستی گرفت.

## به‌روزرسانی نسخه

```powershell
powershell -ExecutionPolicy Bypass -File powershell\update-rose.ps1
```

کد جدید از گیت‌هاب دریافت و جایگزین می‌شود؛ `data` و `.env` دست‌نخورده می‌مانند.

## ساختار پروژه

```
app.py              همه API‌های سرور
static/index.html   پوسته رابط کاربری
static/app.css      استایل (تم رز، واکنش‌گرا)
static/app.js       منطق رابط کاربری
powershell/         اسکریپت‌های استقرار، اجرا، پشتیبان و به‌روزرسانی ویندوز
scripts/make_backup.py  ابزار ساخت پشتیبان
data/               پایگاه داده و فایل‌های ارسالی (به‌طور خودکار ساخته می‌شود؛ در گیت نیست)
```

## پیکربندی (`.env`)

| کلید | توضیح |
| --- | --- |
| `SECRET_KEY` | کلید امضای نشست — خودکار تولید می‌شود |
| `ADMIN_USER` / `ADMIN_PASSWORD` | حساب مدیر اولیه (در نبود آن، فرم ساخت مدیر نمایش داده می‌شود) |
| `MIN_PASSWORD` | حداقل طول رمز (پیش‌فرض ۱۲) |
| `PORT` | پورت سرویس (پیش‌فرض ۸۰۸۸) |
| `BIND_HOST` | آدرس گوش‌دادن. برای پروکسی روی همین سرور، مقدار `127.0.0.1` |
| `SECURE_COOKIE` | روی HTTPS مقدار `1` |
| `TLS_ENABLED` | `1` = گواهی خودامضا ساخته و HTTPS سرو می‌شود |

## امنیت

- رمزها با `werkzeug` هش می‌شوند؛ نشست‌ها HttpOnly + SameSite=Strict و ۷ روز اعتبار دارند.
- همه درخواست‌های تغییردهنده با توکن CSRF محافظت می‌شوند.
- ورود پس از ۱۰ شکست در ۵ دقیقه برای هر IP محدود می‌شود.
- فایل‌ها فقط برای اعضای همان گفتگو قابل دریافت‌اند؛ SVG به‌دلیل امنیت درون‌خطی سرو نمی‌شود.
- **توصیه:** اگر توکن گیت‌هاب در گفتگوها ارسال شده، آن را از Settings → Developer settings → Personal access tokens لغو کنید و توکن تازه را فقط به‌عنوان secret نگهداری کنید.

## شماره موبایل مخاطب

مدیر از «مدیریت ← کاربران» می‌تواند هنگام ایجاد یا بعداً با دکمهٔ تلفن شماره را ثبت یا ویرایش کند. کاربران از «گفت‌وگوی جدید ← یافتن مخاطب با شماره موبایل» گفت‌وگو را شروع می‌کنند. شماره‌های ایران با قالب ۰۹، +۹۸ یا ۰۰۹۸ پذیرفته می‌شوند. برای سایر کشورها از کد کشور استفاده کنید. شماره در فهرست عمومی کاربران نمایش داده نمی‌شود. ثبت شماره با تأیید مدیر انجام می‌شود و پیامک تأیید ارسال نمی‌شود.

## نصب روی موبایل و تماس

دامنهٔ HTTPS رز را در Chrome اندروید باز کنید و «Install app» یا «Add to Home screen» را انتخاب کنید. در Safari آیفون از Share و سپس «Add to Home Screen» استفاده کنید. همگام‌سازی و تماس به اتصال شبکه نیاز دارند. تماس‌ها در گفت‌وگوی خصوصی و با باز بودن برنامه در دو طرف در دسترس‌اند. روی شبکه‌هایی که ارتباط مستقیم برقرار نمی‌شود، coturn را با `use-auth-secret` و `static-auth-secret` راه‌اندازی کنید. `TURN_URLS` را با نشانی‌های جداشده با ویرگول و `TURN_SECRET` را با کلید TURN در `.env` رز تنظیم کنید.

## اتصال تِکنو

اتصال به تغییرات همراه در مخزن تِکنو نیاز دارد. در هر دو سرویس `TEKNO_URL` و `ROSE_PUBLIC_URL` را با مبدأهای عمومی HTTPS و `TEKNO_SSO_SECRET` را با یک کلید تصادفی مشترک تنظیم کنید. این مقادیر را در فایل `.env` هر سرویس اضافه کنید. برای کوکی امن تِکنو، `AUTH_SECURE_COOKIE=1` را در تنظیمات تِکنو قرار دهید. کاربران تِکنو با نشست خود از «پیام‌های داخلی» یا پیوند ورود رز، به یک حساب رز مستقل و بدون دسترسی مدیریتی وارد می‌شوند. مدیر اتاق در رز می‌تواند این کاربران را به گروه و کانال اضافه کند. پیام‌های خصوصی و گروهی برای هر دو طرف در همان اتاق رز قابل ارسال و مشاهده‌اند. در کانال اعضا می‌خوانند و مدیران منتشر می‌کنند. پیوند تِکنو در سربرگ رز به تِکنو بازمی‌گردد.

سوابق صندوق داخلی تِکنو در تِکنو نگهداری می‌شود. عضویت اتاق‌ها، پیام‌های مشترک و فایل‌ها در رز ذخیره می‌شوند. حساب تِکنو پس از اولین ورود به رز در فهرست رز ظاهر می‌شود. نشست یکپارچه تا هشت ساعت اعتبار دارد و مدیر رز می‌تواند دسترسی محلی حساب را غیرفعال کند.

### اجرای ویندوز در کنار تِکنو

برای نصب رز، از PowerShell با دسترسی Administrator استفاده کنید. این دستور فقط سرویس رز را روی پورت ۸۰۸۸ نصب می‌کند.

```powershell
$script = Join-Path $env:TEMP 'deploy-rose.ps1'
Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/sjalilvand/rosemassge/main/powershell/deploy-rose.ps1' -OutFile $script
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script -Action install -Port 8088 -InstallDir 'C:\RoseMessenger'
Invoke-RestMethod 'http://127.0.0.1:8088/api/health'
```

برای رز نصب‌شده، پس از پشتیبان‌گیری از `update-rose.ps1` استفاده کنید. برای فعال‌سازی ارتباط دو سامانه، نسخهٔ تِکنو همراه این قابلیت را از شاخهٔ [rose-bridge](https://github.com/sjalilvand/tekno/tree/rose-bridge) روی نصب تِکنو اعمال کنید. مسیرهای زیر نمونه‌اند. مسیر داده و موتور دیتابیس نصب موجود را در دستور حفظ کنید.

```powershell
$tekno = 'C:\rahe_zendegi\app'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$tekno\deploy.ps1" -Mode update -SafeUpdate -InstallDir $tekno -DataDir 'C:\rahe_zendegi\data' -Branch rose-bridge -AppPort 8089 -DbEngine sqlite
```

یک کلید تصادفی مشترک ایجاد کنید و آن را در هر دو فایل تنظیمات قرار دهید. از مقادیر واقعی دامنه استفاده کنید.

```powershell
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$bridgeSecret = [Convert]::ToBase64String($bytes)
```

برای نگه‌داشتن **پورت عمومی ۸۰۸۸ با HTTPS**، پراکسی روی ۸۰۸۸ و رز پشت آن روی ۱۸۰۸۸ گوش می‌کنند. در فایل `.env` رز **مقدار موجود هر کلید** را با مقدار جدید جایگزین کنید. در تِکنو سه کلید مشترک و `AUTH_SECURE_COOKIE=1` را به فایل `.env` موجود اضافه کنید و تنظیمات فعلی دیتابیس را حفظ کنید. در هر دو فایل مجوز دسترسی را به حساب سرویس و مدیر محدود کنید.

```dotenv
ROSE_PUBLIC_URL=https://rose.example.com:8088
TEKNO_URL=https://tekno.example.com
TEKNO_SSO_SECRET=REPLACE_WITH_THE_SAME_RANDOM_VALUE
PORT=18088
BIND_HOST=127.0.0.1
TLS_ENABLED=0
SECURE_COOKIE=1
```

نمونهٔ Caddy برای پراکسی روی همان ماشین، بعد از تنظیم DNS و گواهی.

```caddyfile
https://rose.example.com:8088 {
    reverse_proxy 127.0.0.1:18088
}
https://tekno.example.com {
    reverse_proxy 127.0.0.1:8089
}
```

سرویس‌ها را پس از ذخیرهٔ تنظیمات راه‌اندازی مجدد کنید. در تِکنو حالت `-SafeUpdate` فایل `.env` را هنگام اجرای Node بارگذاری می‌کند.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'C:\RoseMessenger\powershell\deploy-rose.ps1' -Action restart -InstallDir 'C:\RoseMessenger' -Port 18088
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$tekno\deploy.ps1" -Mode restart -SafeUpdate -InstallDir $tekno -DataDir 'C:\rahe_zendegi\data' -AppPort 8089 -DbEngine sqlite
Invoke-RestMethod 'http://127.0.0.1:18088/api/health'
Invoke-RestMethod 'http://127.0.0.1:8089/api/health'
```
