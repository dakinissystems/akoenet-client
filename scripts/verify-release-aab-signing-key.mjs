/**
 * Compara SHA-1 del keystore de release con android/upload_certificate.pem (clave de subida en Play).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const androidDir = 'android'
const pemPath = join(androidDir, 'upload_certificate.pem')
const propsPath = join(androidDir, 'keystore.properties')

function sha1FromKeytool(text) {
  const m = text.match(/SHA1:\s*([0-9A-F:]+)/i)
  return m ? m[1].toUpperCase() : null
}

function keytool(args) {
  const r = spawnSync('keytool', args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  return { status: r.status ?? 1, out: `${r.stdout || ''}${r.stderr || ''}` }
}

function loadKeystoreProps() {
  if (!existsSync(propsPath)) return null
  const lines = readFileSync(propsPath, 'utf8').split(/\r?\n/)
  const map = {}
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    map[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return map
}

if (!existsSync(pemPath)) {
  console.warn('[verify-aab-key] Sin upload_certificate.pem — omitiendo comparación Play')
  process.exit(0)
}

const pem = keytool(['-printcert', '-file', pemPath])
const pemSha1 = sha1FromKeytool(pem.out)
if (!pemSha1) {
  console.warn('[verify-aab-key] No se pudo leer SHA-1 de upload_certificate.pem')
  process.exit(0)
}

const props = loadKeystoreProps()
if (!props?.storeFile || !props.storePassword || !props.keyAlias) {
  console.warn('[verify-aab-key] keystore.properties incompleto — omitiendo')
  process.exit(0)
}

const storePath = join(androidDir, props.storeFile)
if (!existsSync(storePath)) {
  console.error('[verify-aab-key] No existe keystore:', storePath)
  process.exit(1)
}

const ks = keytool([
  '-list',
  '-v',
  '-keystore',
  storePath,
  '-alias',
  props.keyAlias,
  '-storepass',
  props.storePassword,
  '-keypass',
  props.keyPassword || props.storePassword,
])
const ksSha1 = sha1FromKeytool(ks.out)
if (!ksSha1) {
  console.error('[verify-aab-key] keytool -list falló:', ks.out)
  process.exit(1)
}

console.log('[verify-aab-key] Keystore SHA-1:', ksSha1)
console.log('[verify-aab-key] Play upload_certificate.pem SHA-1:', pemSha1)

if (ksSha1 !== pemSha1) {
  console.error(
    '[verify-aab-key] FALLO: akoenet-release.jks NO coincide con upload_certificate.pem.\n' +
      '  Subir este AAB puede fallar en dispositivos que ya tienen otra firma instalada.\n' +
      '  Play Console → Integridad de la app → clave de subida.\n' +
      '  Usa el mismo .jks con el que se publicó la primera versión aceptada.'
  )
  process.exit(1)
}

console.log('[verify-aab-key] OK — keystore alineado con Play')
