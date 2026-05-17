/**
 * Íconos / splash: usar `@capacitor/assets` cuando exista android/ + recursos base.
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

if (!existsSync('android')) {
  console.log('[generate-android-icons] Skip: no ./android (run cap add android first)')
  process.exit(0)
}

const r = spawnSync('npx', ['@capacitor/assets', 'generate', '--android'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(r.status ?? 1)
