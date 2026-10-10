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

1. Locally the private key is a **single-line base64** string (no line wraps):

```powershell
(Get-Content src-tauri/akoenet-signer.key -Raw).Trim()
```

2. GitHub → **akoenet-client** → Settings → Secrets and variables → Actions → New repository secret:

| Name | Value |
|------|--------|
| `TAURI_SIGNING_PRIVATE_KEY` | That **one line** (paste without wrapping). CI also strips `\n`/`\r` if the UI inserted them. |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Only if the key is password-protected |

Use the **same** key that matches `src-tauri/updater.pubkey` / `tauri.conf.json` `plugins.updater.pubkey`. Regenerating the key breaks updates for users on old builds.

If CI fails with `failed to decode base64 secret key: Invalid character 10`, the secret had a newline — re-paste as one line or re-run after the normalize step in the workflow.

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

1. Open `https://akoenet.dakinissystems.com/releases/desktop/latest.json` — response is **JSON** (not the SPA HTML shell) and `version` matches `package.json`.  
2. `platforms.windows-x86_64.url` returns HTTP 200 for the `.exe`.  
3. `platforms.windows-x86_64.signature` matches the contents of the matching `.sig` from the release.  
4. Launch an older desktop build signed with the **same** pubkey → should notify and install.

`tauri.conf.json` must set `bundle.createUpdaterArtifacts: true` or the build produces installers without `.sig` and CI will fail when generating `latest.json`.

### Bad release / recovery

- Failed Actions run: fix `main`, then **Run workflow** (workflow_dispatch) on latest `main`. You do not need a new tag if the version is unchanged.  
- Bad artifacts already on `main`: revert or replace `public/releases/desktop/*` with a good build, push, wait for Railway.  
- Failed mid-install on a client: reinstall from the Downloads page / GitHub Release `.exe`. Auto-update does not replace a full reinstall if the local install is corrupted.  
- Key compromise: rotate with `npm run updater:setup`, update the GitHub secret, and ship a new signed build; old clients cannot verify updates until they install a build signed with the new key.

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
