/**
 * Ensure the Windows installer referenced in .env.production exists in dist/
 * and is a real PE binary (not index.html from SPA fallback).
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
const minBytes = Number(process.env.DIST_INSTALLER_MIN_BYTES || 500_000)

function installerPathFromEnv() {
  let url = ''
  if (existsSync('.env.production')) {
    const env = readFileSync('.env.production', 'utf8')
    const m = env.match(/^VITE_DESKTOP_INSTALLER_URL=(.+)$/m)
    if (m) url = m[1].trim()
  }
  if (!url) {
    url = `/releases/desktop/AkoeNet_${version}_x64-setup.exe`
  }
  if (url.includes('://')) {
    try {
      return new URL(url).pathname.replace(/^\//, '')
    } catch {
      return null
    }
  }
  return url.replace(/^\//, '')
}

function isPeExecutable(buf) {
  return buf.length >= 2 && buf[0] === 0x4d && buf[1] === 0x5a
}

function isHtmlPayload(buf) {
  const head = buf.subarray(0, Math.min(buf.length, 64)).toString('utf8').toLowerCase()
  return head.includes('<!doctype') || head.includes('<html')
}

const rel = installerPathFromEnv()
if (!rel) {
  console.error('[verify-dist-installer] Could not resolve installer path')
  process.exit(1)
}

const distPath = join('dist', rel)
if (!existsSync(distPath)) {
  console.error(
    `[verify-dist-installer] Missing ${distPath}\n` +
      '  Deploy would serve index.html instead of the installer (broken ~950 byte download).\n' +
      '  Fix: npm run release:desktop && npm run build'
  )
  process.exit(1)
}

const size = statSync(distPath).size
const buf = readFileSync(distPath)
if (size < minBytes || isHtmlPayload(buf) || !isPeExecutable(buf)) {
  console.error(
    `[verify-dist-installer] Invalid installer at ${distPath} (${size} bytes).\n` +
      '  Expected a Windows PE .exe (>500 KB), not HTML.'
  )
  process.exit(1)
}

console.log(`[verify-dist-installer] OK — ${rel} (${(size / (1024 * 1024)).toFixed(2)} MB)`)
