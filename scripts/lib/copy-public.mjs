/**
 * Copy public/ into dist/ for static hosting, excluding release binaries.
 * Release artifacts must not be bundled into Tauri desktop installers.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_SKIP = new Set(['releases'])

export function copyPublicDir(srcRoot, destRoot, skipNames = DEFAULT_SKIP) {
  if (!existsSync(srcRoot)) return
  mkdirSync(destRoot, { recursive: true })
  for (const name of readdirSync(srcRoot)) {
    if (skipNames.has(name)) continue
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
