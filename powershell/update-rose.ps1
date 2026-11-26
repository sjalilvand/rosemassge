# =====================================================================
#  update-rose.ps1 — به‌روزرسانی پیام‌رسان رز از گیت‌هاب بدون از دست رفتن داده‌ها
#  استفاده:
#    powershell -ExecutionPolicy Bypass -File powershell\update-rose.ps1
# =====================================================================
param(
  [string]$InstallDir = 'C:\RoseMessenger',
  [string]$RepoUrl    = 'https://github.com/sjalilvand/rosemassge',
  [string]$Branch     = 'main',
  [int]$Port          = 8088,
  [string]$SourceZip  = ''
)
$ErrorActionPreference = 'Stop'
$TaskName = 'RoseMessenger'
$ProgressPreference = 'SilentlyContinue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

# ---------- رفع خطای TLS: گیت‌هاب فقط TLS 1.2 به بالا را می‌پذیرد ----------
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch {
  try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
}

# ---------- دانلود مقاوم: چند آدرس × سه روش (IWR → curl.exe → BITS) ----------
function Get-RemoteFile {
  param([string[]]$Uris, [string]$OutFile)
  $lastErr = $null
  foreach ($Uri in $Uris) {
    try {
      Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing -TimeoutSec 600
      if ((Get-Item $OutFile -ErrorAction Stop).Length -gt 0) { return }
    } catch { $lastErr = $_ }
    try {
      $curl = (Get-Command curl.exe -ErrorAction SilentlyContinue).Source
      if ($curl) {
        Remove-Item $OutFile -Force -ErrorAction SilentlyContinue
        & $curl.exe -fsSL --retry 3 --retry-delay 2 -o $OutFile $Uri
        if ($LASTEXITCODE -eq 0 -and (Get-Item $OutFile -ErrorAction Stop).Length -gt 0) { return }
      }
    } catch { $lastErr = $_ }
    try {
      Remove-Item $OutFile -Force -ErrorAction SilentlyContinue
      Start-BitsTransfer -Source $Uri -Destination $OutFile -ErrorAction Stop
      if ((Get-Item $OutFile -ErrorAction Stop).Length -gt 0) { return }
    } catch { $lastErr = $_ }
    Write-Host ("[!]  این آدرس پاسخ نداد: " + $Uri) -ForegroundColor Yellow
  }
  throw ("دانلود از همه آدرس‌ها ناموفق بود. آخرین خطا: {0}" -f $lastErr)
}

Write-Host "==> توقف سرویس" -ForegroundColor Magenta
try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue } catch {}

Write-Host "==> دریافت نسخه جدید از گیت‌هاب" -ForegroundColor Magenta
$tmp = Join-Path $env:TEMP ('rose-upd-' + [guid]::NewGuid().ToString('N'))
$zip = Join-Path $env:TEMP 'rosemassge-update.zip'
if ($SourceZip -and (Test-Path $SourceZip)) {
  Copy-Item $SourceZip -Destination $zip -Force
  Write-Host ("به‌روزرسانی آفلاین از فایل: " + $SourceZip) -ForegroundColor Green
} else {
  $repoPath = ($RepoUrl -replace '^https?://github\.com/', '').TrimEnd('/')
  Get-RemoteFile -Uris @(
    ("https://github.com/{0}/archive/refs/heads/{1}.zip" -f $repoPath, $Branch),
    ("https://codeload.github.com/{0}/zip/refs/heads/{1}" -f $repoPath, $Branch)
  ) -OutFile $zip
}
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
