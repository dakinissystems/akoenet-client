# AkoeNet — Client

Cliente web, Android y escritorio (Windows) de **AkoeNet**: comunidades en tiempo real, chat, voz, DMs e integración con StreamAutomator y Twitch.

**Mantenido por [Dakinis Systems](https://dakinissystems.com).**

## Producción

| Servicio | URL |
|----------|-----|
| Web | https://akoenet.dakinissystems.com |
| API | https://api.akoenet.dakinissystems.com |

## Requisitos

- Node.js 20+
- Android: JDK 17+, Android SDK (solo para `.aab`)
- Escritorio: [Rust](https://rustup.rs/) (solo para instalador Windows)

## Comandos

```bash
npm ci
npm run dev              # desarrollo local
npm run build            # build web + copia releases a public/
npm run start            # sirve dist/ (Railway / preview)
npm run sync-versions    # propagar package.json → Android + Tauri
npm run verify-versions  # falla si hay desincronización (también en CI)
npm run release:android  # .aab en releases/android/
npm run release:desktop  # instalador en releases/desktop/ (Rust)
```

## Versionado

**Fuente única:** `package.json` (`1.5.x`).

| Destino | Cómo se actualiza |
|---------|-------------------|
| Web (`__APP_VERSION__`) | Vite lee `package.json` al compilar |
| Android `versionCode` / `versionName` | `npm run sync-versions` → `build.gradle` |
| Tauri / Cargo | `npm run sync-versions` → `tauri.conf.json` + `Cargo.toml` |
| CI | `verify-versions` antes de `npm run build` |

Tras subir la versión en `package.json`, ejecuta `npm run sync-versions` y commitea los archivos derivados. O usa `npm version patch` (dispara `sync-versions` automáticamente).

`versionCode` Android = `major*10000 + minor*100 + patch` (p. ej. `1.5.19` → `10519`).

## Auto-actualización escritorio (Tauri)

1. Secret en GitHub: `TAURI_SIGNING_PRIVATE_KEY` (ver [`docs/DESKTOP-UPDATER.md`](./docs/DESKTOP-UPDATER.md))
2. Bump: `npm run release:desktop:bump` → commit → `git tag vX.Y.Z && git push origin vX.Y.Z`
3. Actions **Desktop updater release** firma el instalador, escribe `latest.json` y lo publica en `main`
4. Railway sirve `https://akoenet.dakinissystems.com/releases/desktop/latest.json`
5. La app de escritorio comprueba actualizaciones al arrancar e instala sola

Manual (local):

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content src-tauri/akoenet-signer.key -Raw
npm run release:desktop
```

## Variables de entorno

Copia `.env.example` → `.env` en desarrollo. En producción, el build usa `.env.production` (API pública, versión del instalador).

Opcionales para la landing:

- `VITE_DESKTOP_INSTALLER_URL` — enlace al `.exe` de Windows
- `VITE_ANDROID_STORE_APPROVED`, `VITE_ANDROID_PLAY_STORE_URL`, `VITE_ANDROID_APK_URL` — cuando Google Play apruebe la app

## Descargas públicas

Tras `npm run build`, los artefactos quedan bajo `/releases/` en el sitio estático (p. ej. instalador Windows, `.aab` Android).

## Licencia

MIT — Copyright (c) Dakinis Systems. Ver [LICENSE](./LICENSE).

## Documentación del ecosistema

Canónica en [dakinis-systems/docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs):

| Doc | Contenido |
|-----|-----------|
| [Índice](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/README.md) | Source of truth |
| [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) | Mapa productos / plataforma |
| [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) | Estado / go-live |
| [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) | Deploy, health, monitorización |
| [SECURITY](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SECURITY.md) | Checklist seguridad P0–P1 |
| [ARCHITECTURE](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/ARCHITECTURE.md) | Arquitectura |
