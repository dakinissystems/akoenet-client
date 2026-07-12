import { getAccessToken } from '../../../services/session-store.js'

/** @returns {string | null} */
function resolveMediaApiBase() {
  const explicit = String(import.meta.env.VITE_MEDIA_API_URL ?? '').trim()
  if (explicit) return explicit.replace(/\/$/, '')
  // Dev only: Vite proxies /media-api → localhost:4090
  if (import.meta.env.DEV) return '/media-api'
  return null
}

export function isMediaApiEnabled() {
  return resolveMediaApiBase() != null
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function api(path, init = {}) {
  const base = resolveMediaApiBase()
  if (!base) throw new Error('media_api_disabled')

  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
  })
  if (!res.ok) throw new Error(`media_api_${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const mediaApi = {
  listTracks: () => api('/tracks'),
  listPlaylists: () => api('/playlists'),
  getPlaylist: (id) => api(`/playlists/${id}`),
  listSkins: () => api('/skins'),
  getSkinManifest: (slug) => api(`/skins/${slug}/manifest`),
  searchStreams: (q) => api(`/streams/search?q=${encodeURIComponent(q)}`),
  createRoom: (body) => api('/rooms', { method: 'POST', body: JSON.stringify(body) }),
}
