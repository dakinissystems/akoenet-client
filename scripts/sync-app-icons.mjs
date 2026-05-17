/**
 * Regenerates desktop (Tauri) and Android launcher icons from public/Akoenet.png.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const root = process.cwd()
const source = join(root, 'public', 'Akoenet.png')
const assetsDir = join(root, 'assets')
const assetsIcon = join(assetsDir, 'icon.png')
const tauriIconsDir = join(root, 'src-tauri', 'icons')
const androidGenerated = join(tauriIconsDir, 'android')
const androidRes = join(root, 'android', 'app', 'src', 'main', 'res')

if (!existsSync(source)) {
  console.error('[sync-app-icons] Missing public/Akoenet.png')
  process.exit(1)
}

mkdirSync(assetsDir, { recursive: true })
copyFileSync(source, assetsIcon)

const iconGen = spawnSync(
  'npx',
  ['tauri', 'icon', source, '-o', tauriIconsDir],
  { stdio: 'inherit', shell: process.platform === 'win32', cwd: root }
)
if (iconGen.status !== 0) process.exit(iconGen.status ?? 1)

if (existsSync(androidGenerated) && existsSync(androidRes)) {
  for (const name of ['mipmap-anydpi-v26', 'mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi', 'values']) {
    const from = join(androidGenerated, name)
    if (!existsSync(from)) continue
    cpSync(from, join(androidRes, name), { recursive: true, force: true })
  }
  console.log('[sync-app-icons] Android mipmaps updated')
}

console.log('[sync-app-icons] Done (Tauri + Android from Akoenet.png)')
