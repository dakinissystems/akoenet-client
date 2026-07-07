# Generate Tauri updater signing keypair and write public key for sync-versions.
# Run from:  cd apps/akoenet/Client; .\scripts\setup-tauri-updater.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$keyPath = "src-tauri/akoenet-signer.key"
$updaterPubPath = "src-tauri/updater.pubkey"

if (-not (Test-Path "package.json")) {
  Write-Error "Run this script from apps/akoenet/Client (package.json not found)."
}

if (-not (Test-Path $keyPath)) {
  $password = Read-Host "Password for signer key (empty = no password)" -AsSecureString
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
  )
  $args = @("run", "tauri", "signer", "generate", "--", "-w", $keyPath, "-f", "--ci")
  if ($plain) { $args += @("-p", $plain) }
  $env:CI = "true"
  npm @args | Out-Null
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$signerPubPath = "$keyPath.pub"
if (-not (Test-Path $signerPubPath)) {
  Write-Error "Missing public key: $signerPubPath"
}

npm run updater:pubkey -- $keyPath | Set-Content -NoNewline -Encoding utf8 $updaterPubPath
Write-Host "[setup-tauri-updater] Wrote $updaterPubPath"
npm run sync-versions
Write-Host "[setup-tauri-updater] Done. Keep $keyPath private; use TAURI_SIGNING_PRIVATE_KEY when building desktop."
