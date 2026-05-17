/**
 * Launcher icons from public/Akoenet.png (Tauri icon + Android mipmaps).
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

if (!existsSync('android')) {
  console.log('[generate-android-icons] Skip: no ./android (run cap add android first)')
  process.exit(0)
}

const r = spawnSync('node', ['scripts/sync-app-icons.mjs'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(r.status ?? 1)
