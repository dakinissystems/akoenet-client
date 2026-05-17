/**
 * Producción Android: necesita Capacitor + carpeta android/ (`npx cap add android`).
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const androidDir = 'android'

if (!existsSync(androidDir)) {
  console.error('[cap-sync-android-mobile] Missing ./android/. Run from Client/: npx cap add android')
  process.exit(1)
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('npm', ['run', 'build'])
run('npx', ['cap', 'sync', 'android'])
