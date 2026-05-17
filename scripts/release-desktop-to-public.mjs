/**
 * Build Tauri desktop installers and copy to releases/desktop/.
 * Requires Rust toolchain: https://rustup.rs/
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

if (!existsSync('src-tauri')) {
  console.error('[release:desktop] ./src-tauri missing; run npx tauri init first.')
  process.exit(1)
}

const version = String(JSON.parse(readFileSync('package.json', 'utf8')).version || '1.0.0')

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('node', ['scripts/sync-tauri-version.mjs'])
run('npm', ['run', 'tauri:build'])

const bundleRoot = join('src-tauri', 'target', 'release', 'bundle')
const outDir = join('releases', 'desktop', version)
mkdirSync(outDir, { recursive: true })

function copyArtifacts(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      copyArtifacts(full)
      continue
    }
    if (/\.(msi|exe|dmg|app\.tar\.gz|AppImage)$/i.test(name)) {
      const dest = join(outDir, name)
      copyFileSync(full, dest)
      console.log('[release:desktop] copied', dest)
    }
  }
}

copyArtifacts(bundleRoot)
console.log('[release:desktop] done — artifacts in', outDir)
