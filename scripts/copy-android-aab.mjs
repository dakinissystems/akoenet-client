/**
 * Copy release .aab to releases/android/ for distribution.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

const version = String(JSON.parse(readFileSync('package.json', 'utf8')).version || '1.0.0')
const src = join('android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab')
if (!existsSync(src)) {
  console.error('[copy-android-aab] Missing', src, '— run npm run mobile:bundle:release first')
  process.exit(1)
}
const outDir = join('releases', 'android')
mkdirSync(outDir, { recursive: true })
const dest = join(outDir, `akoenet-${version}.aab`)
copyFileSync(src, dest)
console.log('[copy-android-aab] wrote', dest)
