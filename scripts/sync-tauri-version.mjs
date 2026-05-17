/**
 * Keep src-tauri version aligned with package.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const version = String(JSON.parse(readFileSync('package.json', 'utf8')).version || '1.0.0')

const confPath = join('src-tauri', 'tauri.conf.json')
const conf = JSON.parse(readFileSync(confPath, 'utf8'))
conf.version = version
writeFileSync(confPath, `${JSON.stringify(conf, null, 2)}\n`)

const cargoPath = join('src-tauri', 'Cargo.toml')
let cargo = readFileSync(cargoPath, 'utf8')
cargo = cargo.replace(/^version = ".*"$/m, `version = "${version}"`)
writeFileSync(cargoPath, cargo)

console.log(`[sync-tauri-version] ${version}`)
