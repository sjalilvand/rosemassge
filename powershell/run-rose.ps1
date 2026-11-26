# =====================================================================
#  run-rose.ps1 — اجرای سریع پیام‌رسان رز برای تست/توسعه (بدون سرویس)
#  استفاده:
#    powershell -ExecutionPolicy Bypass -File powershell\run-rose.ps1
#    سپس در مرورگر: http://localhost:8088
# =====================================================================
param(
  [int]$Port = 8088,
  [switch]$HTTPS
)
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

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

$sysPy = Find-Python
if (-not $sysPy) { throw "Python پیدا نشد؛ از python.org نسخه 3.10+ را نصب کنید" }

if (-not (Test-Path "$Root\.venv")) { & $sysPy -m venv "$Root\.venv" }
$vpy = "$Root\.venv\Scripts\python.exe"
& $vpy -m pip install -r "$Root\requirements.txt" --quiet

if (-not (Test-Path "$Root\.env")) {
  $sec  = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
  $tls  = if ($HTTPS) { '1' } else { '0' }
  $sc   = if ($HTTPS) { '1' } else { '0' }
  @("SECRET_KEY=$sec", "ADMIN_USER=admin", "ADMIN_PASSWORD=", "MIN_PASSWORD=12",
    "PORT=$Port", "DATA_DIR=data", "SECURE_COOKIE=$sc", "TLS_ENABLED=$tls") |
    Set-Content "$Root\.env" -Encoding UTF8
}

$env:PORT = [string]$Port
if ($HTTPS) {
  $env:TLS_ENABLED = '1'
  $env:SECURE_COOKIE = '1'
}
Write-Host "Rose is starting on port $Port (Ctrl+C to stop)." -ForegroundColor Cyan
Push-Location $Root
try { & $vpy (Join-Path $Root 'app.py') }
finally { Pop-Location }
