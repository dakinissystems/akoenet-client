/**
 * Copy built mobile/desktop artifacts into public/releases for static hosting.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

const version = String(JSON.parse(readFileSync('package.json', 'utf8')).version || '1.0.0')
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
  for (const name of readdirSync(desktopDir)) {
    const full = join(desktopDir, name)
    if (!statSync(full).isFile()) continue
    if (/\.(msi|exe|dmg|AppImage)$/i.test(name)) {
      copyIfExists(full, join(publicRoot, 'desktop', name))
    }
  }
}
