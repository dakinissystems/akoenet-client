/**
 * Producción Android: necesita Capacitor + carpeta android/ (`npx cap add android`).
 * No usa `npm run build` (evita copiar public/releases/*.aab|msi|exe al bundle).
 */
import { existsSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { dirSizeBytes } from './lib/copy-public.mjs'

const androidDir = 'android'

if (!existsSync(androidDir)) {
  console.error('[cap-sync-android-mobile] Missing ./android/. Run from Client/: npx cap add android')
  process.exit(1)
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

function mb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1)
}

process.env.VITE_MOBILE_BUILD = '1'
run('npx', ['--no-install', 'vite', 'build'])

// Keep Play / device downloads slim: never ship web release binaries or demo MP3s in the AAB.
const prune = ['dist/releases', 'dist/media/demo', 'dist/media']
for (const p of prune) {
  if (!existsSync(p)) continue
  const before = dirSizeBytes(p)
  rmSync(p, { recursive: true, force: true })
  console.log(`[cap-sync-android-mobile] pruned ${p} (~${mb(before)} MB)`)
}

run('npx', ['--no-install', 'cap', 'sync', 'android'])
