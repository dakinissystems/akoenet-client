/**
 * One-shot helper: bump patch version, sync Android/Tauri, print next steps for auto-update.
 * Usage: node scripts/bump-and-prepare-desktop-release.mjs
 * Then: push main + tag, or run Actions "Desktop updater release".
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const pkgPath = 'package.json'
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const prev = pkg.version
const parts = String(prev).split('.').map((n) => Number(n))
if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
  console.error('[bump] unexpected version:', prev)
  process.exit(1)
}
parts[2] += 1
const next = parts.join('.')
pkg.version = next
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`[bump] ${prev} → ${next}`)

const sync = spawnSync('npm', ['run', 'sync-versions'], { stdio: 'inherit', shell: true })
if (sync.status !== 0) process.exit(sync.status ?? 1)
const verify = spawnSync('npm', ['run', 'verify-versions'], { stdio: 'inherit', shell: true })
if (verify.status !== 0) process.exit(verify.status ?? 1)

console.log(`
Next (auto-update pipeline):
  1. git add -A && git commit -m "chore(release): ${next}"
  2. git push origin main
  3. git tag v${next} && git push origin v${next}
     → Actions "Desktop updater release" builds signed installer,
       commits public/releases/desktop/latest.json + .exe,
       creates GitHub Release v${next}.
  4. Railway redeploys web → https://akoenet.dakinissystems.com/releases/desktop/latest.json
  5. Desktop clients check updates on launch and install automatically.

Secret required: TAURI_SIGNING_PRIVATE_KEY (see docs/DESKTOP-UPDATER.md)
`)
