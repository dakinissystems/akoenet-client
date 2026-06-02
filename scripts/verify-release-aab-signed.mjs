/**
 * Falla si el .aab de release no está firmado (Play: "Todos los bundles deben estar firmados").
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const aab =
  process.argv[2] ||
  join('android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab')

if (!existsSync(aab)) {
  console.error('[verify-release-aab-signed] No existe:', aab)
  process.exit(1)
}

const r = spawnSync('jarsigner', ['-verify', aab], {
  encoding: 'utf8',
  shell: process.platform === 'win32'
})

const out = `${r.stdout || ''}${r.stderr || ''}`
if (/jar is unsigned/i.test(out)) {
  console.error('[verify-release-aab-signed] AAB sin firmar:', aab)
  console.error('Configura android/keystore.properties (ver keystore.properties.example)')
  process.exit(1)
}

if (r.status !== 0) {
  console.error('[verify-release-aab-signed] jarsigner falló:', out)
  process.exit(r.status ?? 1)
}

console.log('[verify-release-aab-signed] OK — bundle firmado')
