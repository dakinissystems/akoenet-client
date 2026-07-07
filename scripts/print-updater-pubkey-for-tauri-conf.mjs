/**
 * Print the public key from a Tauri signer keypair for tauri.conf.json / updater.pubkey.
 *
 * Usage:
 *   npm run updater:pubkey -- path/to/tauri-signer.key
 *   TAURI_SIGNER_KEY_PATH=path/to/key npm run updater:pubkey
 */
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const keyPath = process.argv[2] || process.env.TAURI_SIGNER_KEY_PATH || ''
if (!keyPath || !existsSync(keyPath)) {
  console.error('Usage: npm run updater:pubkey -- <path-to-tauri-signer.key>')
  console.error('Generate keys: npm run tauri signer generate -- -w src-tauri/akoenet-signer.key')
  process.exit(1)
}

const r = spawnSync('npm', ['run', 'tauri', 'signer', 'generate', '--', '-w', keyPath, '-p'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: process.platform === 'win32',
  input: readFileSync(keyPath),
})

if (r.status !== 0) {
  console.error('[updater:pubkey] failed — ensure @tauri-apps/cli is installed')
  process.exit(r.status ?? 1)
}

const pubkey = String(r.stdout || '').trim()
if (!pubkey) {
  console.error('[updater:pubkey] empty output from tauri signer')
  process.exit(1)
}

console.log(pubkey)
console.error('\n[updater:pubkey] Save to src-tauri/updater.pubkey then run: npm run sync-versions')
