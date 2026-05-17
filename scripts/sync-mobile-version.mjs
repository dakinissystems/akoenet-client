/**
 * Sync versionName/versionCode in android/app/build.gradle from package.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const versionName = String(pkg.version || '1.0.0')
const parts = versionName.split('.').map((n) => parseInt(n, 10) || 0)
const [major = 1, minor = 0, patch = 0] = parts
const versionCode = major * 10000 + minor * 100 + patch

const gradlePath = join('android', 'app', 'build.gradle')
let gradle = readFileSync(gradlePath, 'utf8')
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`)
writeFileSync(gradlePath, gradle)
console.log(`[sync-mobile-version] ${versionName} (versionCode ${versionCode})`)
