#!/usr/bin/env node
/**
 * Remove accidental build artifacts and empty folders from the AkoeNet Client tree.
 * Safe to run anytime — only deletes known junk paths.
 *
 * Usage: node scripts/cleanup-workspace.mjs [--dry-run]
 */
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const dryRun = process.argv.includes('--dry-run')

const REMOVE_PATHS = [
  'src-tauri/src-tauri',
  'src-tauri/target',
  'android/app/build',
  'android/.gradle',
  'android/build',
  '../docs',
  '../docs/legal',
]

const NESTED_RES_PATHS = [
  'android/app/src/main/res/values/values',
  'android/app/src/main/res/mipmap-hdpi/mipmap-hdpi',
  'android/app/src/main/res/mipmap-mdpi/mipmap-mdpi',
  'android/app/src/main/res/mipmap-xhdpi/mipmap-xhdpi',
  'android/app/src/main/res/mipmap-xxhdpi/mipmap-xxhdpi',
  'android/app/src/main/res/mipmap-xxxhdpi/mipmap-xxxhdpi',
  'android/app/src/main/res/mipmap-anydpi-v26/mipmap-anydpi-v26',
  'android/app/src/main/java/com/dakinis/akoenet',
]

function removePath(rel) {
  const abs = join(root, rel)
  if (!existsSync(abs)) return false
  const label = dryRun ? '[dry-run] would remove' : 'removed'
  console.log(`[cleanup] ${label}: ${rel}`)
  if (!dryRun) {
    rmSync(abs, { recursive: true, force: true })
  }
  return true
}

function removeEmptyDirs(rel, maxDepth = 4) {
  const abs = join(root, rel)
  if (!existsSync(abs)) return
  let entries
  try {
    entries = readdirSync(abs)
  } catch {
    return
  }
  for (const name of entries) {
    const child = join(abs, name)
    if (statSync(child).isDirectory() && maxDepth > 0) {
      removeEmptyDirs(join(rel, name), maxDepth - 1)
    }
  }
  try {
    if (readdirSync(abs).length === 0) {
      const label = dryRun ? '[dry-run] would remove empty' : 'removed empty'
      console.log(`[cleanup] ${label}: ${rel}`)
      if (!dryRun) rmSync(abs, { recursive: true, force: true })
    }
  } catch {
    /* ignore */
  }
}

let count = 0
for (const rel of [...REMOVE_PATHS, ...NESTED_RES_PATHS]) {
  if (removePath(rel)) count += 1
}
removeEmptyDirs('../docs')

console.log(`[cleanup] done (${count} path(s)${dryRun ? ', dry-run' : ''})`)
