import { useMemo, useSyncExternalStore } from 'react'
import { getApiBaseUrl } from '../lib/apiBase'
import { urlHasVideoEmbed } from '../lib/videoEmbedUrls'

const previewCaches = new Map()

function getLinkPreviewCache(url) {  if (!previewCaches.has(url)) {
    let snapshot = { data: null, status: 'idle' }
    const listeners = new Set()
    let inflight = false

    const emit = () => {
      listeners.forEach((listener) => listener())
    }

    const load = async () => {
      if (inflight) return
      inflight = true
      snapshot = { data: null, status: 'loading' }
      emit()
      try {
        const res = await fetch(`${getApiBaseUrl()}/link-preview?url=${encodeURIComponent(url)}`)
        const json = await res.json()
        if (json?.ok && (json.title || json.description || json.image)) {
          snapshot = { data: json, status: 'ready' }
        } else {
          snapshot = { data: null, status: 'ready' }
        }
      } catch {
        snapshot = { data: null, status: 'error' }
      } finally {
        inflight = false
        emit()
      }
    }

    const subscribe = (listener) => {
      listeners.add(listener)
      if (listeners.size === 1) load()
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) previewCaches.delete(url)
      }
    }

    const getSnapshot = () => snapshot
    previewCaches.set(url, { subscribe, getSnapshot })
  }
  return previewCaches.get(url)
}

function useLinkPreview(url) {
  const cache = getLinkPreviewCache(url)
  const snapshot = useSyncExternalStore(cache.subscribe, cache.getSnapshot, cache.getSnapshot)
  return snapshot.data
}

/**
 * Fetches Open Graph data for the first http(s) URL in message text (server-side SSRF-safe fetch).
 * Skips known video URLs — those are rendered as embeds via MessageVideoEmbeds.
 */
export default function MessageLinkPreview({ content }) {
  const url = useMemo(() => {
    const m = String(content || '').match(/https?:\/\/[^\s<>"'()[\]{}]+/i)
    if (!m) return null
    return m[0].replace(/[.,;:!?)\]]+$/u, '')
  }, [content])

  if (!url || urlHasVideoEmbed(url)) return null

  return <MessageLinkPreviewCard url={url} />
}

function MessageLinkPreviewCard({ url }) {
  const data = useLinkPreview(url)

  if (!data) return null

  return (
    <a
      href={data.url || url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-preview-card"
    >
      {data.image ? (
        <img src={data.image} alt="" className="link-preview-thumb" loading="lazy" />
      ) : null}
      <div className="link-preview-body">
        {data.site_name ? <span className="link-preview-site">{data.site_name}</span> : null}
        {data.title ? <span className="link-preview-title">{data.title}</span> : null}
        {data.description ? (
          <span className="link-preview-desc">{data.description}</span>
        ) : null}
      </div>
    </a>
  )
}