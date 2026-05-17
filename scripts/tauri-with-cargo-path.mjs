/**
 * Proxy a @tauri-apps/cli cuando exista ./src-tauri (desktop).
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

if (!existsSync('src-tauri')) {
  console.error('[tauri] ./src-tauri not in this checkout. Clone full AkoeNet Client or init Tauri.')
  process.exit(1)
}

const args = process.argv.slice(2)
const r = spawnSync('npx', ['tauri', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(r.status ?? 1)
