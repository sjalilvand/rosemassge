# =====================================================================
#  deploy-rose.ps1 — استقرار کامل پیام‌رسان رز روی سرور ویندوز (بدون داکر)
#  سازگار با Windows PowerShell 5.1 و جدیدتر
#
#  نحوه اجرا (PowerShell به‌صورت Administrator):
#    Set-ExecutionPolicy -Scope Process Bypass -Force
#    .\deploy-rose.ps1 -Action install
#
#  دستورها: install | start | stop | restart | status | uninstall
# =====================================================================
param(
  [string]$Action       = 'install',
  [string]$InstallDir   = 'C:\RoseMessenger',
  [int]$Port            = 8088,
  [string]$RepoUrl      = 'https://github.com/sjalilvand/rosemassge',
  [string]$Branch       = 'main',
  [string]$AdminUser    = 'admin',
  [string]$AdminPassword= '',
  [switch]$HTTPS
)

$ErrorActionPreference = 'Stop'
$TaskName  = 'RoseMessenger'
$PythonVer = '3.12.8'
$ProgressPreference = 'SilentlyContinue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

# ---------- رفع خطای «The underlying connection was closed» ----------
# گیت‌هاب و python.org فقط TLS 1.2 به بالا را می‌پذیرند؛
# در Windows PowerShell 5.1 روی برخی سرورها TLS 1.2 پیش‌فرض نیست و باید اجبار شود.
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch {
  try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
}

function Write-Step($m) { Write-Host ("==> " + $m) -ForegroundColor Magenta }
function Write-Ok($m)   { Write-Host ("[OK] " + $m) -ForegroundColor Green }
function Write-Wr($m)   { Write-Host ("[!]  " + $m) -ForegroundColor Yellow }

# ---------- دسترسی Administrator ----------
$wi = [Security.Principal.WindowsIdentity]::GetCurrent()
$wp = New-Object Security.Principal.WindowsPrincipal($wi)
if (-not $wp.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Wr "این اسکریپت باید با دسترسی Administrator اجرا شود؛ درخواست ارتقا..."
  $a = @('-File', $PSCommandPath, '-Action', $Action, '-InstallDir', $InstallDir,
         '-Port', $Port, '-RepoUrl', $RepoUrl, '-Branch', $Branch, '-AdminUser', $AdminUser)
  if ($AdminPassword) { $a += @('-AdminPassword', $AdminPassword) }
  if ($HTTPS) { $a += '-HTTPS' }
  Start-Process powershell -Verb RunAs -ArgumentList $a -Wait
  exit
}

# ---------- فعال‌سازی دائمی رمزنگاری قوی دات‌نت ----------
# با این تنظیم، هر PowerShell جدیدی که روی سرور باز شود به‌طور پیش‌فرض TLS 1.2 دارد.
foreach ($regPath in @('HKLM:\SOFTWARE\Microsoft\.NetFramework\v4.0.30319',
                       'HKLM:\SOFTWARE\Wow6432Node\Microsoft\.NetFramework\v4.0.30319')) {
  try {
    if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    New-ItemProperty -Path $regPath -Name 'SchUseStrongCrypto' -Value 1 -PropertyType DWord -Force | Out-Null
  } catch {}
}

# ---------- دانلود مقاوم: Invoke-WebRequest → curl.exe → BITS ----------
function Get-RemoteFile {
  param([string]$Uri, [string]$OutFile)
  $lastErr = $null
  # تلاش ۱: Invoke-WebRequest (با TLS 1.2 اجباری)
  try {
    Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing -TimeoutSec 600
    if ((Get-Item $OutFile -ErrorAction Stop).Length -gt 0) { return }
  } catch { $lastErr = $_ }
  Write-Wr "روش ۱ ناموفق بود؛ تلاش با curl.exe ..."
  # تلاش ۲: curl.exe (در ویندوز ۱۰/۱۱ و سرور ۲۰۱۹ به بعد داخلی است)
  try {
    $curl = (Get-Command curl.exe -ErrorAction SilentlyContinue).Source
    if ($curl) {
      Remove-Item $OutFile -Force -ErrorAction SilentlyContinue
      & $curl.exe -fsSL --retry 3 --retry-delay 2 -o $OutFile $Uri
      if ($LASTEXITCODE -eq 0 -and (Get-Item $OutFile -ErrorAction Stop).Length -gt 0) { return }
    }
  } catch { $lastErr = $_ }
  Write-Wr "روش ۲ ناموفق بود؛ تلاش با BITS ..."
  # تلاش ۳: BITS (از پشته WinHTTP سیستم استفاده می‌کند)
  try {
    Remove-Item $OutFile -Force -ErrorAction SilentlyContinue
    Start-BitsTransfer -Source $Uri -Destination $OutFile -ErrorAction Stop
    if ((Get-Item $OutFile -ErrorAction Stop).Length -gt 0) { return }
  } catch { $lastErr = $_ }
  throw ("دانلود ناموفق بود: {0}`nآخرین خطا: {1}" -f $Uri, $lastErr)
}

function Find-Python {
  foreach ($py in @('py', 'python', 'python3')) {
    try {
      $v = & $py -c 'import sys;print(sys.executable)' 2>$null
      if ($LASTEXITCODE -eq 0 -and $v) { return $v.Trim() }
    } catch {}
  }
  foreach ($d in @("$env:ProgramFiles\Python312", "${env:ProgramFiles(x86)}\Python312",
                   "$env:LOCALAPPDATA\Programs\Python\Python312")) {
    $exe = Join-Path $d 'python.exe'
    if (Test-Path $exe) { return $exe }
  }
  return $null
}

function Get-SecurePlain($secure) {
  $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}

$pyExe = Join-Path $InstallDir '.venv\Scripts\python.exe'
$taskAct = 'cmd.exe'
$taskArg = '/c "cd /d ' + $InstallDir + ' && if not exist logs mkdir logs && .venv\Scripts\python.exe app.py >> logs\rose.log 2>&1"'

# ---------- مدیریت سرویس ----------
function Stop-Rose {
  try {
    $t = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Write-Ok "سرویس $TaskName متوقف شد"
  } catch { Write-Wr "سرویسی به نام $TaskName یافت نشد" }
}
function Start-Rose {
  try {
    Start-ScheduledTask -TaskName $TaskName
    Start-Sleep -Seconds 4
    try {
      $h = Invoke-WebRequest -UseBasicParsing ("http://127.0.0.1:{0}/api/health" -f $Port) -TimeoutSec 10
      Write-Ok ("سرویس فعال است: " + $h.Content)
    } catch { Write-Wr "پاسخ سلامت دریافت نشد؛ لاگ را ببینید: $InstallDir\logs\rose.log" }
  } catch { Write-Wr "سرویسی به نام $TaskName یافت نشد؛ ابتدا -Action install را اجرا کنید" }
}

switch ($Action.ToLower()) {
  'start'   { Start-Rose; exit }
  'stop'    { Stop-Rose;  exit }
  'restart' { Stop-Rose; Start-Sleep 2; Start-Rose; exit }
  'status'  {
    try { Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State } catch { Write-Wr "نصب نشده است" }
    try { (Invoke-WebRequest -UseBasicParsing ("http://127.0.0.1:{0}/api/health" -f $Port) -TimeoutSec 5).Content } catch { Write-Wr "سرویس پاسخ نمی‌دهد" }
    exit
  }
  'uninstall' {
    Stop-Rose
    try { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false; Write-Ok "Task حذف شد" } catch {}
    try { Remove-NetFirewallRule -DisplayName 'Rose Messenger' -ErrorAction SilentlyContinue } catch {}
    Write-Ok "حذف انجام شد (پوشه $InstallDir و داده‌ها باقی مانده است)"
    exit
  }
}

# ================= نصب کامل =================
if ($Action.ToLower() -ne 'install') { Write-Wr "Action نامعتبر: $Action"; exit }

Write-Step "۱/۸ بررسی Python"
$sysPy = Find-Python
if (-not $sysPy) {
  Write-Wr "Python یافت نشد؛ نصب خودکار Python $PythonVer ..."
  $inst = Join-Path $env:TEMP ("python-{0}-amd64.exe" -f $PythonVer)
  Get-RemoteFile -Uri ("https://www.python.org/ftp/python/{0}/python-{0}-amd64.exe" -f $PythonVer) -OutFile $inst
  $p = Start-Process -FilePath $inst -ArgumentList '/quiet', 'InstallAllUsers=1', 'PrependPath=1', 'Include_test=0', 'Include_launcher=1' -Wait -PassThru
  if ($p.ExitCode -ne 0) { throw "نصب Python ناموفق بود (کد $($p.ExitCode))" }
  $sysPy = Find-Python
  if (-not $sysPy) { throw "پس از نصب، Python پیدا نشد؛ یک‌بار PowerShell را بسته و دوباره باز کنید" }
}
Write-Ok ("Python: " + $sysPy)

Write-Step "۲/۸ دریافت سورس از گیت‌هاب"
$tmp   = Join-Path $env:TEMP ('rose-src-' + [guid]::NewGuid().ToString('N'))
$zip   = Join-Path $env:TEMP 'rosemassge-main.zip'
Get-RemoteFile -Uri ("{0}/archive/refs/heads/{1}.zip" -f $RepoUrl, $Branch) -OutFile $zip
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
Expand-Archive -Path $zip -DestinationPath $tmp -Force
$srcRoot = Get-ChildItem $tmp -Directory | Select-Object -First 1
Write-Ok ("سورس دریافت شد: " + $srcRoot.FullName)

Write-Step "۳/۸ کپی پروژه در $InstallDir"
if (-not (Test-Path $InstallDir)) { New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null }
foreach ($item in @('app.py', 'requirements.txt', 'static', 'powershell', 'scripts', 'README.md', '.env.example')) {
  $sp = Join-Path $srcRoot.FullName $item
  if (Test-Path $sp) {
    Copy-Item $sp -Destination (Join-Path $InstallDir $item) -Recurse -Force
  }
}
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Write-Ok "فایل‌ها کپی شد (data و .env دست‌نخورده ماند)"

Write-Step "۴/۸ ساخت محیط مجازی و نصب وابستگی‌ها"
if (-not (Test-Path "$InstallDir\.venv")) { & $sysPy -m venv "$InstallDir\.venv" }
& $pyExe -m pip install --upgrade pip --quiet
& $pyExe -m pip install -r "$InstallDir\requirements.txt" --quiet
if ($LASTEXITCODE -ne 0) { throw "نصب وابستگی‌ها ناموفق بود" }
Write-Ok "وابستگی‌ها نصب شد (Flask, waitress, cryptography)"

Write-Step "۵/۸ ساخت فایل پیکربندی .env"
$envFile = Join-Path $InstallDir '.env'
if (-not $AdminPassword) {
  $sec = Read-Host ("رمز کاربر «{0}» را وارد کنید (حداقل ۱۲ نویسه)" -f $AdminUser) -AsSecureString
  $AdminPassword = Get-SecurePlain $sec
}
if ($AdminPassword.Length -lt 12) { throw "رمز مدیر باید حداقل ۱۲ نویسه باشد" }
$secureCookie = if ($HTTPS) { '1' } else { '0' }
$tlsEnabled   = if ($HTTPS) { '1' } else { '0' }
$envLines = @(
  "SECRET_KEY=$([guid]::NewGuid().ToString('N'))$([guid]::NewGuid().ToString('N'))",
  "ADMIN_USER=$AdminUser",
  "ADMIN_PASSWORD=$AdminPassword",
  "MIN_PASSWORD=12",
  "PORT=$Port",
  "DATA_DIR=data",
  "SECURE_COOKIE=$secureCookie",
  "TLS_ENABLED=$tlsEnabled"
)
if ($HTTPS) {
  try {
    $pubIp = (Invoke-WebRequest -UseBasicParsing 'https://api.ipify.org' -TimeoutSec 8).Content.Trim()
    if ($pubIp) { $envLines += "TLS_HOST=$pubIp" }
  } catch { Write-Wr "تشخیص IP عمومی ناموفق بود؛ گواهی فقط localhost را پوشش می‌دهد" }
}
Set-Content -Path $envFile -Value $envLines -Encoding UTF8
Write-Ok ".env ساخته شد"

Write-Step "۶/۸ باز کردن پورت $Port در فایروال"
try {
  Remove-NetFirewallRule -DisplayName 'Rose Messenger' -ErrorAction SilentlyContinue
  New-NetFirewallRule -DisplayName 'Rose Messenger' -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
  Write-Ok "قانون فایروال ساخته شد"
} catch { Write-Wr ("ساخت قانون فایروال ناموفق: " + $_.Exception.Message) }

Write-Step "۷/۸ ساخت سرویس ویندوز (Scheduled Task)"
Stop-Rose
$tAction    = New-ScheduledTaskAction -Execute $taskAct -Argument $taskArg
$tTrigger   = New-ScheduledTaskTrigger -AtStartup -RandomDelay (New-TimeSpan -Minutes 1)
$tPrincipal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$tSettings  = New-ScheduledTaskSettingsSet -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $TaskName -Action $tAction -Trigger $tTrigger -Principal $tPrincipal -Settings $tSettings -Force | Out-Null
Write-Ok "Task ثبت شد؛ اجرای خودکار پس از ری‌استارت سرور فعال است"

Write-Step "۸/۸ راه‌اندازی"
Start-Rose

$proto = if ($HTTPS) { 'https' } else { 'http' }
$ip    = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' } | Select-Object -First 1).IPAddress
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Ok  ("پیام‌رسان رز آماده است:  {0}://{1}:{2}   (یا: {0}://localhost:{2})" -f $proto, $ip, $Port)
Write-Host ("    کاربر مدیر: " + $AdminUser) -ForegroundColor Cyan
Write-Host ("    پوشه نصب:   " + $InstallDir) -ForegroundColor Cyan
Write-Host ("    لاگ:        " + $InstallDir + "\logs\rose.log") -ForegroundColor Cyan
Write-Host "    مدیریت سرویس: .\deploy-rose.ps1 -Action status|restart|stop|uninstall" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
