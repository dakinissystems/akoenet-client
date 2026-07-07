/**
 * Fail if derived version files drift from package.json (CI + prebuild guard).
 */
import process from 'node:process'
import {
  readAndroidVersion,
  readCargoVersion,
  readPackageLockVersion,
  readPackageVersion,
  readTauriVersion,
  versionCodeFromSemver,
} from './lib/version.mjs'

const expected = readPackageVersion()
const expectedCode = versionCodeFromSemver(expected)
const errors = []

try {
  const android = readAndroidVersion()
  if (android.versionName !== expected) {
    errors.push(`android/app/build.gradle versionName "${android.versionName}" ≠ package.json "${expected}"`)
  }
  if (android.versionCode !== expectedCode) {
    errors.push(
      `android/app/build.gradle versionCode ${android.versionCode} ≠ expected ${expectedCode} (from ${expected})`
    )
  }
} catch (err) {
  errors.push(String(err.message || err))
}

try {
  const tauri = readTauriVersion()
  if (tauri !== expected) {
    errors.push(`src-tauri/tauri.conf.json version "${tauri}" ≠ package.json "${expected}"`)
  }
} catch (err) {
  errors.push(String(err.message || err))
}

try {
  const cargo = readCargoVersion()
  if (cargo !== expected) {
    errors.push(`src-tauri/Cargo.toml version "${cargo}" ≠ package.json "${expected}"`)
  }
} catch (err) {
  errors.push(String(err.message || err))
}

try {
  const lock = readPackageLockVersion()
  if (lock && lock !== expected) {
    errors.push(`package-lock.json version "${lock}" ≠ package.json "${expected}"`)
  }
} catch {
  /* package-lock optional in some contexts */
}

if (errors.length) {
  console.error('[verify-versions] Version mismatch — run: npm run sync-versions')
  for (const e of errors) console.error(`  • ${e}`)
  process.exit(1)
}

console.log(`[verify-versions] OK — all targets at ${expected} (versionCode ${expectedCode})`)
