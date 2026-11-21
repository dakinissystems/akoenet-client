/**
 * Fail deploy if dist/releases/desktop/latest.json is missing or is HTML
 * (SPA fallback) — desktop auto-update depends on real JSON at that path.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const distPath = join('dist', 'releases', 'desktop', 'latest.json')

if (!existsSync(distPath)) {
  console.error(
    `[verify-dist-updater-manifest] Missing ${distPath}\n` +
      '  Updater URL would return SPA HTML. Ensure public/releases/desktop/latest.json\n' +
      '  survives prune-public-releases and publish-release-assets.'
  )
  process.exit(1)
}

const raw = readFileSync(distPath, 'utf8')
const head = raw.slice(0, 64).toLowerCase()
if (head.includes('<!doctype') || head.includes('<html')) {
  console.error(`[verify-dist-updater-manifest] ${distPath} looks like HTML, not JSON`)
  process.exit(1)
}

let parsed
try {
  parsed = JSON.parse(raw)
} catch (err) {
  console.error(`[verify-dist-updater-manifest] Invalid JSON: ${err.message}`)
  process.exit(1)
}

const win = parsed?.platforms?.['windows-x86_64']
if (!parsed?.version || !win?.url) {
  console.error('[verify-dist-updater-manifest] Manifest missing version or windows-x86_64.url')
  process.exit(1)
}

console.log(`[verify-dist-updater-manifest] OK — version=${parsed.version} url=${win.url}`)
