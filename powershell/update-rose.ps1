# =====================================================================
#  update-rose.ps1 — به‌روزرسانی پیام‌رسان رز از گیت‌هاب بدون از دست رفتن داده‌ها
#  استفاده:
#    powershell -ExecutionPolicy Bypass -File powershell\update-rose.ps1
# =====================================================================
param(
  [string]$InstallDir = 'C:\RoseMessenger',
  [string]$RepoUrl    = 'https://github.com/sjalilvand/rosemassge',
  [string]$Branch     = 'main',
  [int]$Port          = 8088
)
$ErrorActionPreference = 'Stop'
$TaskName = 'RoseMessenger'
$ProgressPreference = 'SilentlyContinue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
Write-Host "==> توقف سرویس" -ForegroundColor Magenta
try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue } catch {}

Write-Host "==> دریافت نسخه جدید از گیت‌هاب" -ForegroundColor Magenta
$tmp = Join-Path $env:TEMP ('rose-upd-' + [guid]::NewGuid().ToString('N'))
$zip = Join-Path $env:TEMP 'rosemassge-update.zip'
Invoke-WebRequest -Uri ("{0}/archive/refs/heads/{1}.zip" -f $RepoUrl, $Branch) -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $tmp -Force
$src = (Get-ChildItem $tmp -Directory | Select-Object -First 1).FullName

Write-Host "==> جایگزینی فایل‌های کد (data و .env حفظ می‌شود)" -ForegroundColor Magenta
foreach ($item in @('app.py', 'requirements.txt', 'static', 'powershell', 'scripts', 'README.md', '.env.example')) {
  $sp = Join-Path $src $item
  if (Test-Path $sp) { Copy-Item $sp -Destination (Join-Path $InstallDir $item) -Recurse -Force }
}
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "==> به‌روزرسانی وابستگی‌ها" -ForegroundColor Magenta
$py = Join-Path $InstallDir '.venv\Scripts\python.exe'
& $py -m pip install -r (Join-Path $InstallDir 'requirements.txt') --quiet

Write-Host "==> راه‌اندازی مجدد" -ForegroundColor Magenta
try { Start-ScheduledTask -TaskName $TaskName } catch { Write-Host "[!] سرویس یافت نشد؛ پس از نصب مجدد اجرا کنید" }
Start-Sleep -Seconds 4
try {
  $h = Invoke-WebRequest -UseBasicParsing ("http://127.0.0.1:{0}/api/health" -f $Port) -TimeoutSec 10
  Write-Host ("[OK] به‌روزرسانی موفق: " + $h.Content) -ForegroundColor Green
} catch {
  Write-Host "[!] سرویس پاسخ نداد؛ لاگ را بررسی کنید: $InstallDir\logs\rose.log" -ForegroundColor Yellow
}
