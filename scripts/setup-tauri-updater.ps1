# Generate Tauri updater signing keypair and write public key for sync-versions.
# Run from:  cd apps/akoenet/Client; .\scripts\setup-tauri-updater.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$keyPath = "src-tauri/akoenet-signer.key"
$updaterPubPath = "src-tauri/updater.pubkey"
$printScript = "scripts/print-updater-pubkey-for-tauri-conf.mjs"

if (-not (Test-Path "package.json")) {
  Write-Error "Run this script from apps/akoenet/Client (package.json not found)."
}

$regenerate = $false
if (Test-Path $keyPath) {
  $answer = Read-Host "Key exists at $keyPath. Regenerate? (y/N)"
  if ($answer -match '^[yY]') { $regenerate = $true }
}

if (-not (Test-Path $keyPath) -or $regenerate) {
  if ($regenerate -and (Test-Path $keyPath)) {
    Remove-Item -Force $keyPath, "$keyPath.pub" -ErrorAction SilentlyContinue
  }
  $env:CI = "true"
  npm run tauri signer generate -- -w $keyPath -f --ci | Out-Null
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "[setup-tauri-updater] Generated new keypair at $keyPath"
}

$signerPubPath = "$keyPath.pub"
if (-not (Test-Path $signerPubPath)) {
  Write-Error "Missing public key: $signerPubPath"
}

# Use node directly — piping npm run captures lifecycle banners into the pubkey file.
$pubkey = node $printScript $keyPath
if (-not $pubkey) {
  Write-Error "Could not read public key from $keyPath"
}
Set-Content -Path $updaterPubPath -Value $pubkey -NoNewline -Encoding utf8
Write-Host "[setup-tauri-updater] Wrote $updaterPubPath"

npm run sync-versions
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[setup-tauri-updater] Done."
Write-Host "  Private key (never commit): $keyPath"
Write-Host "  Public key (committed):     $updaterPubPath"
Write-Host "  Desktop signed build:"
Write-Host "    `$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content $keyPath -Raw"
Write-Host "    npm run release:desktop"
