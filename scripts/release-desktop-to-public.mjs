/**
 * Build Tauri desktop installers and copy to releases/desktop/.
 * Requires Rust toolchain: https://rustup.rs/
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { readPackageVersion } from './lib/version.mjs'

if (!existsSync('src-tauri')) {
  console.error('[release:desktop] ./src-tauri missing; run npx tauri init first.')
  process.exit(1)
}

const version = readPackageVersion()
const targetRoot = process.env.CARGO_TARGET_DIR || join('src-tauri', 'target')
const bundleRoot = join(targetRoot, 'release', 'bundle')

function run(cmd, args, env = undefined) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: env ? { ...process.env, ...env } : process.env,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('node', ['scripts/sync-all-versions.mjs'])
run('node', ['scripts/verify-versions.mjs'])
run('npm', ['run', 'tauri:build'], { CARGO_TARGET_DIR: targetRoot })

const outDir = join('releases', 'desktop', version)
const publicDesktop = join('public', 'releases', 'desktop')
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
mkdirSync(publicDesktop, { recursive: true })

const versionToken = `_${version}_`

function copyArtifacts(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      copyArtifacts(full)
      continue
    }
    if (!/\.(msi|exe|dmg|app\.tar\.gz|AppImage|sig)$/i.test(name)) continue
    if (!name.includes(versionToken) && !name.includes(`_${version}.`) && !name.endsWith(`${version}.sig`)) {
      continue
    }
    const dest = join(outDir, name)
    copyFileSync(full, dest)
    console.log('[release:desktop] copied', dest)
    if (/\.(msi|exe)$/i.test(name)) {
      const publicDest = join(publicDesktop, name)
      copyFileSync(full, publicDest)
      console.log('[release:desktop] published', publicDest)
    }
  }
}

copyArtifacts(bundleRoot)

const hasInstaller = readdirSync(outDir).some((n) => /\.(msi|exe)$/i.test(n))
if (!hasInstaller) {
  console.error(`[release:desktop] No ${version} installer found under ${bundleRoot}`)
  process.exit(1)
}

run('node', ['scripts/verify-desktop-installer-size.mjs'])
run('node', ['scripts/generate-desktop-updater-manifest.mjs'])
console.log('[release:desktop] done — artifacts in', outDir)
