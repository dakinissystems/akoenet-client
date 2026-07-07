/**
 * Keep src-tauri version aligned with package.json and refresh updater config.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readPackageVersion } from './lib/version.mjs'
import { syncTauriUpdaterConfig } from './sync-tauri-updater.mjs'

const version = readPackageVersion()

const confPath = join('src-tauri', 'tauri.conf.json')
const conf = JSON.parse(readFileSync(confPath, 'utf8'))
conf.version = version
writeFileSync(confPath, `${JSON.stringify(conf, null, 2)}\n`)

const cargoPath = join('src-tauri', 'Cargo.toml')
let cargo = readFileSync(cargoPath, 'utf8')
cargo = cargo.replace(/^version = ".*"$/m, `version = "${version}"`)
writeFileSync(cargoPath, cargo)

syncTauriUpdaterConfig()

console.log(`[sync-tauri-version] ${version}`)
