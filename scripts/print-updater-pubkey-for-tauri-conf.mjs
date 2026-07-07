/**
 * Print the public key from a Tauri signer keypair for tauri.conf.json / updater.pubkey.
 *
 * Usage:
 *   node scripts/print-updater-pubkey-for-tauri-conf.mjs path/to/tauri-signer.key
 *   npm run updater:pubkey -- path/to/tauri-signer.key.pub
 */
import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'
import { isValidUpdaterPubkey, normalizeUpdaterPubkey } from './lib/updater-pubkey.mjs'

const inputPath = process.argv[2] || process.env.TAURI_SIGNER_KEY_PATH || ''
if (!inputPath) {
  console.error('Usage: npm run updater:pubkey -- <path-to-tauri-signer.key|.pub>')
  console.error('Generate keys: npm run tauri signer generate -- -w src-tauri/akoenet-signer.key -f')
  process.exit(1)
}

function pubCandidates(input) {
  if (input.endsWith('.pub')) return [input]
  const base = input.replace(/\.key$/i, '')
  return [`${base}.pub`, `${input}.pub`]
}

for (const path of pubCandidates(inputPath)) {
  if (!existsSync(path)) continue
  const pubkey = normalizeUpdaterPubkey(readFileSync(path, 'utf8'))
  if (isValidUpdaterPubkey(pubkey)) {
    console.log(pubkey)
    process.exit(0)
  }
}

console.error('[updater:pubkey] No .pub file found for', inputPath)
console.error('[updater:pubkey] Run: npm run tauri signer generate -- -w src-tauri/akoenet-signer.key -f')
process.exit(1)
