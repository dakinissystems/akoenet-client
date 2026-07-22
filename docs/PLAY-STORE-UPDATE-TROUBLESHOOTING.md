# Play Store: "No se puede instalar" al actualizar

Mensaje genérico de Google Play. Causas habituales en AkoeNet y cómo comprobarlas.

## 1. Firma distinta en el dispositivo (la más frecuente)

Android **solo actualiza** si el APK nuevo tiene la **misma firma** que la app instalada.

| Instalación previa | Actualización desde Play |
|--------------------|---------------------------|
| APK debug / `adb install` local | ❌ Suele fallar |
| AAB/APK firmado con **otro** `.jks` | ❌ Falla |
| Primera instalación desde Play (misma app + misma clave de subida) | ✅ OK |

**Qué hacer en el móvil:** Ajustes → Apps → AkoeNet → **Desinstalar** → volver a instalar desde Play (no APK suelto).

**Qué hacer al publicar:** Siempre el mismo `android/akoenet-release.jks` (alias `akoenet`). Antes de subir:

```bash
npm run mobile:bundle:release
```

Incluye `verify-release-aab-signing-key.mjs`: compara el SHA-1 del keystore con `android/upload_certificate.pem`.

## 2. `upload_certificate.pem` desactualizado

En Play Console: **Integridad de la app** → **Clave de subida** → exportar certificado PEM y sustituir `android/upload_certificate.pem`.

Huella actual del keystore de release (jun 2026):

- SHA-1: `94:9E:3D:16:61:6C:D4:26:9B:00:06:B3:7E:23:19:7E:19:2C:4C:C9`

Si el PEM del repo no coincide, el script de verificación falla **antes** de copiar el AAB a `releases/android/`.

## 3. Cambio de package (`com.dakinis.akoenet` → `com.akoenet.app`)

No se puede cambiar el `applicationId` en la misma ficha de Play. Son **dos apps** en el dispositivo si coexisten.

- Ficha Play debe ser `com.akoenet.app` (como el AAB actual).
- Quien tenga instalado el paquete antiguo debe **desinstalarlo**; la “actualización” en Play no lo reemplaza.

## 4. `versionCode` menor o igual

Cada subida debe llevar `versionCode` **mayor** que la publicada (p. ej. 10515 → 10516). El script `sync-mobile-version.mjs` lo toma de `package.json`.

## 5. Target API level (Play Console)

Google Play exige un `targetSdkVersion` reciente:

| Fecha | Apps existentes (visibilidad) | Nuevas apps / **updates** |
|-------|------------------------------|---------------------------|
| Desde 31 ago 2025 | — | API **35** |
| Desde **31 ago 2026** | Debe ser ≥ **35** o deja de mostrarse a usuarios en Android más nuevo | Debe ser ≥ **36** |

En el repo: `android/variables.gradle` → `compileSdkVersion` / `targetSdkVersion` (**36**).

Si Play avisa “orientada a una versión antigua”, la ficha publicada aún tiene un AAB viejo: genera y sube un release nuevo:

```bash
npm run mobile:bundle:release
```

Luego Play Console → producción / prueba interna → subir el `.aab`.

## 6. Pista en Play Console

Tras subir el AAB: **Versiones** → revisar que no haya avisos de firma o compatibilidad. En **Prueba interna / Alpha**, confirma que el tester está en la lista y que la versión ya está **publicada** (no solo “borrador”).

## Checklist rápido

1. `node scripts/verify-release-aab-signing-key.mjs` → OK  
2. Play → Integridad → SHA-1 de subida = keystore  
3. `applicationId` del AAB = ficha Play (`com.akoenet.app`)  
4. `versionCode` nuevo  
5. `targetSdkVersion` ≥ 36 (updates tras 31 ago 2026)  
6. En el móvil con error: desinstalar → instalar desde Play  
