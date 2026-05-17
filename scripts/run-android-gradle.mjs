/**
 * Gradle wrapper portable (Linux/macOS/Windows); evita usar solo gradlew.bat en package.json.
 * Uso: node scripts/run-android-gradle.mjs bundleRelease
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const task = process.argv[2] || 'bundleRelease'
const androidDir = join(process.cwd(), 'android')
const win = process.platform === 'win32'
const gw = win ? join(androidDir, 'gradlew.bat') : join(androidDir, 'gradlew')

if (!existsSync(gw)) {
  console.error('[run-android-gradle] Gradle wrapper not found. Add Android platform: npx cap add android')
  process.exit(1)
}

const r = spawnSync(gw, [task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: win,
  env: { ...process.env },
})

process.exit(r.status ?? 1)
