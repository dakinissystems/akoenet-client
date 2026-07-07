# Desktop updater signing (Tauri)

AkoeNet desktop builds use **minisign** keys for the Tauri auto-updater. The **private key never goes in git**; only the public key is committed.

## First-time setup (or after losing the key)

From `apps/akoenet/Client`:

```powershell
npm run updater:setup
```

Or manually:

```powershell
$env:CI = "true"
npm run tauri signer generate -- -w src-tauri/akoenet-signer.key -f --ci
node scripts/print-updater-pubkey-for-tauri-conf.mjs src-tauri/akoenet-signer.key | Set-Content -NoNewline -Encoding utf8 src-tauri/updater.pubkey
npm run sync-versions
```

**Important:** Regenerating the key invalidates signatures on installers already published. Users on old builds cannot auto-update until they install a build signed with the new key.

## Signed release build

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content src-tauri/akoenet-signer.key -Raw
npm run release:desktop
npm run updater:manifest
```

Upload `public/releases/desktop/` (installers, `.sig` files, `latest.json`) to hosting.

## Files

| File | Git | Purpose |
|------|-----|---------|
| `src-tauri/akoenet-signer.key` | **ignored** | Private signing key |
| `src-tauri/akoenet-signer.key.pub` | optional | Minisign public key export |
| `src-tauri/updater.pubkey` | committed | Public key for `sync-versions` |
| `src-tauri/tauri.conf.json` | committed | Updater endpoint + pubkey |

## Workspace cleanup

Remove accidental nested `src-tauri/src-tauri`, Rust `target/`, Gradle caches:

```bash
npm run cleanup
npm run cleanup:dry   # preview only
```

## CI guard

`npm run verify-versions` checks version alignment. Updater pubkey must be valid minisign (no npm script banners). If `tauri.conf.json` pubkey looks corrupted, re-run `npm run updater:setup`.
