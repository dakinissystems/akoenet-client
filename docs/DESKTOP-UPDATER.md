# Desktop updater signing (Tauri)

AkoeNet desktop builds use **minisign** keys for the Tauri auto-updater. The **private key never goes in git**; only the public key is committed.

Clients check for updates on launch (`runDesktopUpdateCheck` in `src/main.jsx`) against:

`https://akoenet.dakinissystems.com/releases/desktop/latest.json`

---

## Automatic releases (recommended)

GitHub Actions workflow: **Desktop updater release**  
(`.github/workflows/desktop-updater-release.yml`)

| Trigger | Effect |
|---------|--------|
| Push tag `v1.5.x` | Build signed Windows installer → commit `public/releases/desktop/*` to `main` → GitHub Release |
| Manual **Run workflow** | Same, using current `package.json` version |

After `main` gets the artifacts, Railway redeploys the web app and the updater endpoint serves the new build. Installed desktops pick it up on next launch.

### One-time: add the signing secret

1. Locally (if you already have the key):

```powershell
Get-Content src-tauri/akoenet-signer.key -Raw
```

2. GitHub → **akoenet-client** → Settings → Secrets and variables → Actions → New repository secret:

| Name | Value |
|------|--------|
| `TAURI_SIGNING_PRIVATE_KEY` | Full contents of `akoenet-signer.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Only if the key is password-protected |

Use the **same** key that matches `src-tauri/updater.pubkey` / `tauri.conf.json` `plugins.updater.pubkey`. Regenerating the key breaks updates for users on old builds.

### Release a new auto-update

```powershell
npm run release:desktop:bump
# follow printed git tag steps, or:
git add -A && git commit -m "chore(release): x.y.z"
git push origin main
git tag vx.y.z && git push origin vx.y.z
```

Or: Actions → **Desktop updater release** → Run workflow (after bumping version on `main`).

### Verify

1. Open `https://akoenet.dakinissystems.com/releases/desktop/latest.json` — `version` matches.  
2. Installer URL in the JSON returns HTTP 200.  
3. Launch an older desktop build → should notify and install.

---

## First-time key setup (or after losing the key)

From repo root (`akoenet-client`):

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

## Local signed release (optional)

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content src-tauri/akoenet-signer.key -Raw
npm run release:desktop
```

Then commit `public/releases/desktop/` (or rely on CI).

## Files

| File | Git | Purpose |
|------|-----|---------|
| `src-tauri/akoenet-signer.key` | **ignored** | Private signing key |
| `src-tauri/akoenet-signer.key.pub` | optional | Minisign public key export |
| `src-tauri/updater.pubkey` | committed | Public key for `sync-versions` |
| `src-tauri/tauri.conf.json` | committed | Updater endpoint + pubkey |
| `public/releases/desktop/latest.json` | committed | Manifest served in prod |
| `public/releases/desktop/*.exe` | committed | Installer downloaded by updater |

## Workspace cleanup

```bash
npm run cleanup
npm run cleanup:dry
```

## CI guard

`npm run verify-versions` checks version alignment. Updater pubkey must be valid minisign. If `tauri.conf.json` pubkey looks corrupted, re-run `npm run updater:setup`.
