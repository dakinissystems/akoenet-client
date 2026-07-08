/**
 * Copy built mobile/desktop artifacts into public/releases and dist/releases for static hosting.
 * Do not run during mobile:bundle:release — cap-sync uses vite build without this step.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
const publicRoot = join('public', 'releases')
const distRoot = join('dist', 'releases')

function copyIfExists(src, dest) {
  if (!existsSync(src)) return false
  mkdirSync(join(dest, '..'), { recursive: true })
  copyFileSync(src, dest)
  console.log('[publish-release-assets]', dest)
  return true
}

function copyDesktopArtifactsFromDir(sourceDir, destRoots) {
  if (!existsSync(sourceDir)) return 0
  const versionToken = `_${version}_`
  let copied = 0
  for (const name of readdirSync(sourceDir)) {
    const full = join(sourceDir, name)
    if (!statSync(full).isFile()) continue
    if (!/\.(msi|exe|dmg|AppImage|sig|json)$/i.test(name)) continue
    if (
      !name.includes(versionToken) &&
      !name.includes(`_${version}.`) &&
      name !== 'latest.json'
    ) {
      continue
    }
    for (const destRoot of destRoots) {
      if (copyIfExists(full, join(destRoot, 'desktop', name))) copied += 1
    }
  }
  return copied
}

spawnSync('node', ['scripts/prune-public-releases.mjs'], { stdio: 'inherit' })

mkdirSync(join(publicRoot, 'android'), { recursive: true })
mkdirSync(join(publicRoot, 'desktop'), { recursive: true })
mkdirSync(join(distRoot, 'android'), { recursive: true })
mkdirSync(join(distRoot, 'desktop'), { recursive: true })

const aabSrc = join('releases', 'android', `akoenet-${version}.aab`)
const aabName = `akoenet-${version}.aab`
copyIfExists(aabSrc, join(publicRoot, 'android', aabName))
copyIfExists(aabSrc, join(distRoot, 'android', aabName))

const desktopFromRelease = join('releases', 'desktop', version)
const desktopFromPublic = join(publicRoot, 'desktop')
let desktopCopied = copyDesktopArtifactsFromDir(desktopFromRelease, [publicRoot, distRoot])
if (!desktopCopied) {
  desktopCopied = copyDesktopArtifactsFromDir(desktopFromPublic, [distRoot])
  if (desktopCopied) {
    console.log('[publish-release-assets] copied desktop installers from public/releases → dist')
  }
}

const latestPublic = join(publicRoot, 'desktop', 'latest.json')
const latestDist = join(distRoot, 'desktop', 'latest.json')
if (existsSync(latestPublic) && !existsSync(latestDist)) {
  copyIfExists(latestPublic, latestDist)
}
if (existsSync(latestDist)) {
  console.log('[publish-release-assets] desktop updater manifest present in dist')
}
