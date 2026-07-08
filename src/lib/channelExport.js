import { getApiBaseUrl } from './apiBase'
import { getAccessToken } from '../services/session-store'

export async function exportChannelHistory(channelId, format) {
  const token = getAccessToken()
  if (!token || !channelId) return false
  const baseURL = getApiBaseUrl()
  try {
    const res = await fetch(`${baseURL}/messages/channel/${channelId}/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return false
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `channel-${channelId}-messages.${format}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  } catch {
    return false
  }
}
