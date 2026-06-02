/**
 * Producción Android: necesita Capacitor + carpeta android/ (`npx cap add android`).
 * No usa `npm run build` (evita copiar public/releases/*.aab|msi|exe al bundle).
 */
import { existsSync, rmSync } from 'node:fs'
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

run('npx', ['vite', 'build'])
// Vite copia todo public/; releases/ es solo para descargas web (~500MB).
rmSync('dist/releases', { recursive: true, force: true })
run('npx', ['cap', 'sync', 'android'])
