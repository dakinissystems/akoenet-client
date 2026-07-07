/**
 * Propagate package.json version to Android (Gradle) and Tauri (conf + Cargo).
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
console.log(`[sync-versions] package.json → ${version}`)

function run(script) {
  const r = spawnSync(process.execPath, [script], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('scripts/sync-mobile-version.mjs')
run('scripts/sync-tauri-version.mjs')
