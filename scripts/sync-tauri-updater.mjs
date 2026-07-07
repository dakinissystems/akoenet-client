/**
 * Apply Tauri updater pubkey from env or src-tauri/updater.pubkey (public key only).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isValidUpdaterPubkey, normalizeUpdaterPubkey, readUpdaterPubkeyFromFile } from './lib/updater-pubkey.mjs'

const confPath = join('src-tauri', 'tauri.conf.json')
const pubkeyFile = join('src-tauri', 'updater.pubkey')

function readPubkey() {
  const fromEnv = normalizeUpdaterPubkey(process.env.TAURI_UPDATER_PUBKEY || '')
  if (isValidUpdaterPubkey(fromEnv)) return fromEnv
  const fromFile = readUpdaterPubkeyFromFile(pubkeyFile)
  if (isValidUpdaterPubkey(fromFile)) return fromFile
  return ''
}

export function syncTauriUpdaterConfig() {
  const conf = JSON.parse(readFileSync(confPath, 'utf8'))
  const pubkey = readPubkey()
  conf.plugins = conf.plugins || {}
  conf.plugins.updater = conf.plugins.updater || {}
  conf.plugins.updater.endpoints = conf.plugins.updater.endpoints || [
    'https://akoenet.dakinissystems.com/releases/desktop/latest.json',
  ]
  conf.plugins.updater.dialog = conf.plugins.updater.dialog ?? true
  conf.plugins.updater.pubkey = pubkey
  conf.plugins.updater.active = Boolean(pubkey)
  writeFileSync(confPath, `${JSON.stringify(conf, null, 2)}\n`)
  if (pubkey) {
    console.log('[sync-tauri-updater] updater active (pubkey configured)')
  } else {
    console.log('[sync-tauri-updater] updater inactive — add src-tauri/updater.pubkey or TAURI_UPDATER_PUBKEY')
  }
  return Boolean(pubkey)
}
