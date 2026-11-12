/**
 * Keep only the current version in public/releases (web downloads).
 */
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
const publicRoot = join('public', 'releases')

function pruneDir(dir, keepPattern) {
  if (!existsSync(dir)) return 0
  let removed = 0
  for (const name of readdirSync(dir)) {
    if (name === '.gitkeep') continue
    const full = join(dir, name)
    if (!statSync(full).isFile()) continue
    if (keepPattern(name)) continue
    rmSync(full, { force: true })
    console.log('[prune-public-releases] removed', full)
    removed += 1
  }
  return removed
}

const desktopMarker = `_${version}_`.toLowerCase()
const androidName = `akoenet-${version}.aab`.toLowerCase()

const n1 = pruneDir(join(publicRoot, 'desktop'), (n) => n.toLowerCase().includes(desktopMarker))
const n2 = pruneDir(join(publicRoot, 'android'), (n) => n.toLowerCase() === androidName)
console.log(`[prune-public-releases] done — removed ${n1 + n2} stale file(s), keeping ${version}`)
