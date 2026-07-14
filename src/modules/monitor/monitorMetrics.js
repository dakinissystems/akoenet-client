import api from '../../services/api.js'

/**
 * Métricas del cliente (browser) — no reemplaza métricas de servidor.
 */
export function sampleClientMetrics() {
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const perf = typeof performance !== 'undefined' ? performance : {}
  const mem = perf.memory

  return {
    at: new Date().toISOString(),
    online: nav.onLine !== false,
    cores: nav.hardwareConcurrency || null,
    connection: nav.connection?.effectiveType || null,
    downlinkMbps: nav.connection?.downlink ?? null,
    rttMs: nav.connection?.rtt ?? null,
    memoryUsedMb: mem ? Math.round(mem.usedJSHeapSize / 1048576) : null,
    memoryTotalMb: mem ? Math.round(mem.totalJSHeapSize / 1048576) : null,
    memoryLimitMb: mem ? Math.round(mem.jsHeapSizeLimit / 1048576) : null,
    pageVisible: typeof document !== 'undefined' ? !document.hidden : true,
    loadMs:
      perf.timing && perf.timing.loadEventEnd > 0
        ? Math.max(0, perf.timing.loadEventEnd - perf.timing.navigationStart)
        : null,
  }
}

/**
 * Ping API AkoeNet — liveness + deps (Postgres, Redis, storage…).
 */
export async function fetchServiceHealth() {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now()
  try {
    const [healthRes, depsRes] = await Promise.all([
      api.get('/health', { validateStatus: () => true, timeout: 8000 }),
      api.get('/health/deps', { validateStatus: () => true, timeout: 8000 }),
    ])
    const latencyMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started
    )
    return {
      at: new Date().toISOString(),
      latencyMs,
      apiOk: healthRes.status === 200,
      depsOk: depsRes.status === 200,
      health: healthRes.status === 200 ? healthRes.data : null,
      deps: depsRes.status === 200 ? depsRes.data : null,
    }
  } catch {
    return {
      at: new Date().toISOString(),
      latencyMs: null,
      apiOk: false,
      depsOk: false,
      health: null,
      deps: null,
    }
  }
}

/**
 * @param {object} deps
 */
export function summarizeDeps(deps) {
  if (!deps || typeof deps !== 'object') {
    return { postgres: null, redis: null, storage: null, scheduler: null }
  }
  return {
    postgres: deps.postgres ?? deps.db ?? deps.database ?? null,
    redis: deps.redis ?? null,
    storage: deps.storage ?? deps.s3 ?? null,
    scheduler: deps.scheduler ?? deps.scheduler_api ?? null,
    uptimeMs: deps.uptime_ms ?? deps.uptimeMs ?? null,
    version: deps.version ?? null,
  }
}

/**
 * @param {number|null} used
 * @param {number|null} limit
 */
export function memoryPercent(used, limit) {
  if (!used || !limit || limit <= 0) return null
  return Math.min(100, Math.round((used / limit) * 100))
}
