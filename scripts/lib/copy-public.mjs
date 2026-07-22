/**
 * Copy public/ into dist/ for static hosting, excluding release binaries.
 * Release artifacts must not be bundled into Tauri desktop installers.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_SKIP = new Set(['releases'])

export function copyPublicDir(srcRoot, destRoot, skipNames = DEFAULT_SKIP) {
  if (!existsSync(srcRoot)) return
  const skip = new Set(skipNames)
  // Android AAB: demo MP3s (~18MB) must not ship — Play warns about download size.
  if (process.env.VITE_MOBILE_BUILD === '1') {
    skip.add('media')
  }
  mkdirSync(destRoot, { recursive: true })
  for (const name of readdirSync(srcRoot)) {
    if (skip.has(name)) continue
    const from = join(srcRoot, name)
    const to = join(destRoot, name)
    cpSync(from, to, { recursive: true, force: true })
  }
}

export function dirSizeBytes(root) {
  if (!existsSync(root)) return 0
  let total = 0
  for (const name of readdirSync(root)) {
    const full = join(root, name)
    const st = statSync(full)
    total += st.isDirectory() ? dirSizeBytes(full) : st.size
  }
  return total
}
