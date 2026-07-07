/**
 * Fail if desktop installers are abnormally large (usually means public/releases was bundled).
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { readPackageVersion } from './lib/version.mjs'

const version = readPackageVersion()
const maxMb = Number(process.env.DESKTOP_INSTALLER_MAX_MB || 150)
const maxBytes = maxMb * 1024 * 1024

const dirs = [
  join('releases', 'desktop', version),
  join('public', 'releases', 'desktop'),
]

let checked = 0
for (const dir of dirs) {
  if (!existsSync(dir)) continue
  for (const name of readdirSync(dir)) {
    if (!/\.(exe|msi)$/i.test(name) || !name.includes(version)) continue
    const full = join(dir, name)
    if (!statSync(full).isFile()) continue
    checked += 1
    const size = statSync(full).size
    const mb = (size / (1024 * 1024)).toFixed(1)
    if (size > maxBytes) {
      console.error(
        `[verify-desktop-installer-size] ${full} is ${mb} MB (max ${maxMb} MB).\n` +
          '  Likely cause: public/releases was bundled into dist during vite build.\n' +
          '  Use npm run build:app for Tauri; ensure vite excludes public/releases.'
      )
      process.exit(1)
    }
    console.log(`[verify-desktop-installer-size] OK — ${name} (${mb} MB)`)
  }
}

if (!checked) {
  console.warn('[verify-desktop-installer-size] No installers found to check')
}
