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

1. Generar claves: `npm run tauri signer generate -- -w src-tauri/akoenet-signer.key`
2. Extraer pubkey: `npm run updater:pubkey -- src-tauri/akoenet-signer.key` → guardar en `src-tauri/updater.pubkey`
3. `npm run sync-versions` (activa `plugins.updater` si hay pubkey)
4. Build firmado: `TAURI_SIGNING_PRIVATE_KEY="$(cat src-tauri/akoenet-signer.key)" npm run release:desktop`
5. Se publica `public/releases/desktop/latest.json` junto al `.exe` firmado

## Variables de entorno

Copia `.env.example` → `.env` en desarrollo. En producción, el build usa `.env.production` (API pública, versión del instalador).

Opcionales para la landing:

- `VITE_DESKTOP_INSTALLER_URL` — enlace al `.exe` de Windows
- `VITE_ANDROID_STORE_APPROVED`, `VITE_ANDROID_PLAY_STORE_URL`, `VITE_ANDROID_APK_URL` — cuando Google Play apruebe la app

## Descargas públicas

Tras `npm run build`, los artefactos quedan bajo `/releases/` en el sitio estático (p. ej. instalador Windows, `.aab` Android).

## Licencia

MIT — Copyright (c) Dakinis Systems. Ver [LICENSE](./LICENSE).
