# =====================================================================
#  backup-rose.ps1 — تهیه نسخه پشتیبان کامل پیام‌رسان رز
#  خروجی: ZIP شامل پایگاه داده و همه فایل‌های ارسالی در پوشه backups
#  استفاده:
#    powershell -ExecutionPolicy Bypass -File powershell\backup-rose.ps1
#  پارامترها: -InstallDir C:\RoseMessenger -Keep 30
# =====================================================================
param(
  [string]$InstallDir = 'C:\RoseMessenger',
  [int]$Keep = 30
)
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

$py   = Join-Path $InstallDir '.venv\Scripts\python.exe'
$tool = Join-Path $InstallDir 'scripts\make_backup.py'
if (-not (Test-Path $py))   { throw "Python محیط نصب یافت نشد؛ ابتدا deploy-rose.ps1 -Action install را اجرا کنید" }
if (-not (Test-Path $tool)) { throw "ابزار پشتیبان یافت نشد: $tool" }

$out = & $py $tool -d (Join-Path $InstallDir 'backups') -k $Keep
Write-Host ($out -join "`n")
