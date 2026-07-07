/**
 * Build Tauri updater manifest (latest.json) from signed desktop release artifacts.
 * Requires .sig files from `tauri build` with TAURI_SIGNING_PRIVATE_KEY set.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
const publicOrigin = String(process.env.VITE_PUBLIC_ORIGIN || 'https://akoenet.dakinissystems.com').replace(
  /\/$/,
  ''
)

const desktopDir = join('releases', 'desktop', version)
const outPath = join('public', 'releases', 'desktop', 'latest.json')

const PLATFORM_PATTERNS = [
  { key: 'windows-x86_64', artifact: /_x64-setup\.exe$/i, sig: /_x64-setup\.exe\.sig$/i },
  { key: 'windows-x86_64', artifact: /_x64_en-US\.msi$/i, sig: /_x64_en-US\.msi\.sig$/i },
]

function listFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile())
}

function readSig(dir, pattern) {
  const name = listFiles(dir).find((n) => pattern.test(n))
  if (!name) return null
  return readFileSync(join(dir, name), 'utf8').trim()
}

function findArtifact(dir, pattern) {
  return listFiles(dir).find((n) => pattern.test(n)) || null
}

const platforms = {}
for (const { key, artifact, sig } of PLATFORM_PATTERNS) {
  const artifactName = findArtifact(desktopDir, artifact)
  const signature = readSig(desktopDir, sig)
  if (!artifactName || !signature) continue
  if (platforms[key]) continue
  platforms[key] = {
    signature,
    url: `${publicOrigin}/releases/desktop/${artifactName}`,
  }
}

if (!Object.keys(platforms).length) {
  console.warn(
    `[generate-desktop-updater-manifest] No signed artifacts in ${desktopDir} — skip latest.json (build desktop with TAURI_SIGNING_PRIVATE_KEY)`
  )
  process.exit(0)
}

const manifest = {
  version,
  notes: `AkoeNet ${version}`,
  pub_date: new Date().toISOString(),
  platforms,
}

mkdirSync(join(outPath, '..'), { recursive: true })
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log('[generate-desktop-updater-manifest]', outPath)
