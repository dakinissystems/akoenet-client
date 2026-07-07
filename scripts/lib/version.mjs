/**
 * Shared semver helpers — package.json is the single source of truth.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SEMVER_RE = /^\d+\.\d+\.\d+$/

export function readPackageVersion(cwd = process.cwd()) {
  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'))
  const version = String(pkg.version || '').trim()
  if (!SEMVER_RE.test(version)) {
    throw new Error(`package.json version must be semver (x.y.z), got "${version}"`)
  }
  return version
}

export function versionCodeFromSemver(version) {
  const parts = version.split('.').map((n) => parseInt(n, 10) || 0)
  const [major = 1, minor = 0, patch = 0] = parts
  return major * 10000 + minor * 100 + patch
}

export function readAndroidVersion(cwd = process.cwd()) {
  const gradle = readFileSync(join(cwd, 'android', 'app', 'build.gradle'), 'utf8')
  const nameMatch = gradle.match(/versionName\s+"([^"]+)"/)
  const codeMatch = gradle.match(/versionCode\s+(\d+)/)
  if (!nameMatch || !codeMatch) {
    throw new Error('android/app/build.gradle: missing versionName or versionCode')
  }
  return { versionName: nameMatch[1], versionCode: Number(codeMatch[1]) }
}

export function readTauriVersion(cwd = process.cwd()) {
  const conf = JSON.parse(readFileSync(join(cwd, 'src-tauri', 'tauri.conf.json'), 'utf8'))
  return String(conf.version || '').trim()
}

export function readCargoVersion(cwd = process.cwd()) {
  const cargo = readFileSync(join(cwd, 'src-tauri', 'Cargo.toml'), 'utf8')
  const match = cargo.match(/^version\s*=\s*"([^"]+)"/m)
  if (!match) throw new Error('src-tauri/Cargo.toml: missing version')
  return match[1]
}

export function readPackageLockVersion(cwd = process.cwd()) {
  const lock = JSON.parse(readFileSync(join(cwd, 'package-lock.json'), 'utf8'))
  return String(lock.version || lock.packages?.['']?.version || '').trim()
}
