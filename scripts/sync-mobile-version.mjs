/**
 * Sync versionName/versionCode in android/app/build.gradle from package.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readPackageVersion, versionCodeFromSemver } from './lib/version.mjs'

const versionName = readPackageVersion()
const versionCode = versionCodeFromSemver(versionName)

const gradlePath = join('android', 'app', 'build.gradle')
let gradle = readFileSync(gradlePath, 'utf8')
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`)
writeFileSync(gradlePath, gradle)
console.log(`[sync-mobile-version] ${versionName} (versionCode ${versionCode})`)
