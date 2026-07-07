# Generate Tauri updater signing keypair and write public key for sync-versions.
# Run from repo root:  apps/akoenet/Client
#   .\scripts\setup-tauri-updater.ps1
# Or: cd apps/akoenet/Client first.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$keyPath = "src-tauri/akoenet-signer.key"
$pubPath = "src-tauri/updater.pubkey"

if (-not (Test-Path "package.json")) {
  Write-Error "Run this script from apps/akoenet/Client (package.json not found)."
}

$password = Read-Host "Password for signer key (empty = no password)" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

$args = @("run", "tauri", "signer", "generate", "--", "-w", $keyPath, "-f", "--ci")
if ($plain) { $args += @("-p", $plain) }

$env:CI = "true"
npm @args | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run updater:pubkey -- $keyPath | Set-Content -NoNewline -Encoding utf8 $pubPath
Write-Host "[setup-tauri-updater] Wrote $pubPath"
npm run sync-versions
Write-Host "[setup-tauri-updater] Done. Keep $keyPath private; use TAURI_SIGNING_PRIVATE_KEY when building desktop."
