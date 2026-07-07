/**
 * Copy built mobile/desktop artifacts into public/releases for static hosting (web only).
 * No ejecutar en mobile:bundle:release — cap-sync-android-mobile usa vite build sin este paso.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
const publicRoot = join('public', 'releases')

function copyIfExists(src, dest) {
  if (!existsSync(src)) return false
  mkdirSync(join(dest, '..'), { recursive: true })
  copyFileSync(src, dest)
  console.log('[publish-release-assets]', dest)
  return true
}

mkdirSync(join(publicRoot, 'android'), { recursive: true })
mkdirSync(join(publicRoot, 'desktop'), { recursive: true })

copyIfExists(
  join('releases', 'android', `akoenet-${version}.aab`),
  join(publicRoot, 'android', `akoenet-${version}.aab`)
)

const desktopDir = join('releases', 'desktop', version)
if (existsSync(desktopDir)) {
  const versionToken = `_${version}_`
  for (const name of readdirSync(desktopDir)) {
    const full = join(desktopDir, name)
    if (!statSync(full).isFile()) continue
    if (!/\.(msi|exe|dmg|AppImage|sig)$/i.test(name)) continue
    if (!name.includes(versionToken) && !name.includes(`_${version}.`)) continue
    copyIfExists(full, join(publicRoot, 'desktop', name))
  }
}

const latestJson = join(publicRoot, 'desktop', 'latest.json')
if (existsSync(latestJson)) {
  console.log('[publish-release-assets] desktop updater manifest present')
}
