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
npm run release:android  # .aab en releases/android/
npm run release:desktop  # instalador en releases/desktop/ (Rust)
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
