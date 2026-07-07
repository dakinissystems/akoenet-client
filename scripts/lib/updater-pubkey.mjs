/**
 * Tauri updater minisign public key helpers.
 * Rejects npm script banners accidentally piped into pubkey files.
 */
import { existsSync, readFileSync } from 'node:fs'

const MINISIGN_PUBKEY_RE = /^[A-Za-z0-9+/=\r\n]+$/

/** Extract a clean minisign public key from raw file or corrupted npm-piped output. */
export function normalizeUpdaterPubkey(raw) {
  const text = String(raw || '').trim()
  if (!text) return ''

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const candidates = []

  for (const line of lines) {
    if (line.startsWith('>') || line.includes('updater:pubkey')) continue
    if (MINISIGN_PUBKEY_RE.test(line) && line.length >= 40) {
      candidates.push(line)
    }
  }

  if (candidates.length) {
    return candidates.sort((a, b) => b.length - a.length)[0]
  }

  const embedded = text.match(/[A-Za-z0-9+/=]{40,}/g)
  if (embedded?.length) {
    return embedded.sort((a, b) => b.length - a.length)[0]
  }

  return ''
}

export function isValidUpdaterPubkey(pubkey) {
  const clean = normalizeUpdaterPubkey(pubkey)
  return Boolean(clean) && clean.length >= 40 && MINISIGN_PUBKEY_RE.test(clean)
}

export function readUpdaterPubkeyFromFile(path) {
  if (!existsSync(path)) return ''
  return normalizeUpdaterPubkey(readFileSync(path, 'utf8'))
}
