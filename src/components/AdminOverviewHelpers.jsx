export { default as StatusBadge } from './AdminStatusBadge'
export { default as Latency } from './AdminLatency'
export { default as AdminKpiCard } from './AdminKpiCard'

export function formatNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString()
}

export function formatUptimeMs(ms) {
  if (ms == null || !Number.isFinite(Number(ms))) return '—'
  const s = Math.floor(Number(ms) / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function readyStateIcon(state) {
  if (state === 'connected' || state === 'ok' || state === 'local') return '✅'
  if (state === 'not_configured') return '⚪'
  return '❌'
}

export function readyStateLabel(state, t) {
  if (state === 'connected') return t('admin.readyConnected')
  if (state === 'disconnected') return t('admin.readyDisconnected')
  if (state === 'not_configured') return t('admin.readyNotConfigured')
  return state || '—'
}
