# AkoeNet — Client

**AkoeNet** is a digital communities platform with real-time chat, voice channels, direct messages, and integrations with Twitch and [StreamAutomator](https://streamautomator.com). It is a product of **[Dakinis Systems](https://dakinissystems.com)**.

This repository is the **client**: web app, Android (Capacitor), and Windows desktop (Tauri). The API lives in [`akoenet-backend`](https://github.com/dakinissystems/akoenet-backend). Cross-cutting architecture, ops, and security docs stay in [`dakinis-systems/docs`](https://github.com/dakinissystems/dakinis-systems/tree/main/docs) — this README does not duplicate them.

| Platform | Status |
|----------|--------|
| Web | Production |
| Windows desktop | Production installer + auto-update (Tauri) |
| Android | Build/release pipeline ready; Google Play listing pending approval |
| iOS / macOS / Linux native | Not shipped yet — use the web app |

Current version: see `package.json` (source of truth).

---

## Production & downloads

| Surface | Link |
|---------|------|
| Web app | https://akoenet.dakinissystems.com |
| Downloads page (in-app) | https://akoenet.dakinissystems.com/download |
| API | https://api.akoenet.dakinissystems.com |
| Desktop updater manifest | https://akoenet.dakinissystems.com/releases/desktop/latest.json |
| Windows installer | https://akoenet.dakinissystems.com/releases/desktop/AkoeNet_*VERSION*_x64-setup.exe (also linked from `/download`; `VERSION` matches `latest.json` when published) |
| Android | Not a public sideload yet — Play Store when approved. CI builds a signed **`.aab`** for Play Console only (not an APK users can tap to install). |

> If `latest.json` returns the SPA HTML shell, the desktop release artifacts are not on `main` yet — run **Actions → Desktop updater release** on current `main` (requires `TAURI_SIGNING_PRIVATE_KEY` and `bundle.createUpdaterArtifacts`).

---

## Requirements

- **Node.js 20+**
- **Android** (optional): JDK 17+, Android SDK — only for `.aab` / Capacitor
- **Windows desktop** (optional): [Rust](https://rustup.rs/) — only to build the installer

---

## Local development

```bash
npm ci
npm run dev
```

| Command | What it does |
|---------|----------------|
| `npm ci` | Install dependencies from the lockfile (clean install) |
| `npm run dev` | Start the Vite dev server |

Open the URL Vite prints (usually `http://localhost:5173`). Copy `.env.example` → `.env` and set `VITE_API_URL` if you are not using the defaults.

---

## Common commands

```bash
npm ci
npm run dev
npm run build
npm run start
npm run sync-versions
npm run verify-versions
npm run release:android
npm run release:desktop
```

| Command | What it does |
|---------|----------------|
| `npm ci` | Install locked dependencies |
| `npm run dev` | Local development (Vite) |
| `npm run build` | Production web build, then copy known release assets into `public/` / `dist/` (`publish-release-assets`) and verify the dist installer path |
| `npm run start` | Serve `dist/` (Railway / local preview) |
| `npm run sync-versions` | Propagate `package.json` version → Android Gradle + Tauri + Cargo |
| `npm run verify-versions` | Fail if versions drift (also runs in CI / `prebuild`) |
| `npm run release:android` | Signed Play **`.aab`** under `releases/android/` (not an end-user APK) |
| `npm run release:desktop` | Build signed Windows installer + updater `latest.json` (needs Rust + signing key) |

Related: `npm run release:desktop:bump` bumps the patch version and syncs targets before you tag/push.

---

## Versioning & releases

**Single source of truth:** `package.json`.

| Target | How it stays in sync |
|--------|----------------------|
| Web (`__APP_VERSION__`) | Vite injects `package.json` version at build time |
| Android `versionName` / `versionCode` | `npm run sync-versions` → `android/app/build.gradle` |
| Tauri / Cargo | `npm run sync-versions` → `tauri.conf.json` + `Cargo.toml` |
| CI | `verify-versions` before build |

`versionCode` = `major*10000 + minor*100 + patch` (e.g. `1.5.36` → `10536`).

After bumping `package.json`, run `npm run sync-versions` and commit the derived files — or use `npm version patch` (hooks call sync automatically).

**Desktop release (recommended):**

1. Ensure GitHub secret `TAURI_SIGNING_PRIVATE_KEY` is set ([details](./docs/DESKTOP-UPDATER.md)).
2. `npm run release:desktop:bump` → commit → push `main`.
3. `git tag vX.Y.Z && git push origin vX.Y.Z` **or** Actions → **Desktop updater release** → Run workflow on `main`.
4. Workflow builds with `createUpdaterArtifacts`, writes `public/releases/desktop/latest.json` + `.exe`/`.sig`, commits to `main`, creates a GitHub Release.
5. Railway redeploys the web host; installed desktops check updates on launch.

Tags should point at a commit that already includes updater config (`bundle.createUpdaterArtifacts`). Prefer **workflow_dispatch on latest `main`** if a tag was cut before a CI fix.

---

## Desktop auto-update (summary)

Full procedure, verification, and key rotation: [`docs/DESKTOP-UPDATER.md`](./docs/DESKTOP-UPDATER.md).

- Manifest URL: `https://akoenet.dakinissystems.com/releases/desktop/latest.json`
- Requires signed artifacts (`.sig`) + valid `pubkey` in `tauri.conf.json`
- Private key: **GitHub Actions secret only**. Local file `src-tauri/akoenet-signer.key` is gitignored; only `*.key.pub` / `updater.pubkey` are committed. If a private key ever landed in git history, treat it as compromised and rotate.

Manual local build (PowerShell):

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content src-tauri/akoenet-signer.key -Raw
npm run release:desktop
```

Do not commit the private key. Do not rely on a key in the repo for CI.

---

## Environment variables

Development: copy `.env.example` → `.env`.  
Production build: `.env.production` (public API origin, installer URL/version for the landing).

Optional landing / store flags:

- `VITE_DESKTOP_INSTALLER_URL` / `VITE_DESKTOP_INSTALLER_VERSION` — Windows download link shown on the site
- `VITE_ANDROID_STORE_APPROVED`, `VITE_ANDROID_PLAY_STORE_URL`, `VITE_ANDROID_APK_URL` — when Play (or a public APK) is ready

---

## License

**MIT** — Copyright (c) Dakinis Systems. See [LICENSE](./LICENSE).

This license applies to **this client repository**. It does not automatically cover `akoenet-backend` or other private Dakinis products.

---

## Ecosystem documentation

Canonical docs: [dakinis-systems/docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)

| Doc | Content |
|-----|---------|
| [Index](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/README.md) | Source of truth |
| [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) | Product / platform map |
| [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) | Go-live status |
| [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) | Deploy, health, monitoring |
| [SECURITY](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SECURITY.md) | Security checklist |
| [ARCHITECTURE](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/ARCHITECTURE.md) | Architecture |
