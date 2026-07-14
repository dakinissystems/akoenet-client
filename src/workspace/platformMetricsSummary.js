/**
 * Resumen legible de GET /workspace/metrics para widgets Monitor/Dashboard/DevOps.
 * @param {object|null|undefined} data
 */
export function summarizeWorkspaceMetrics(data) {
  if (!data) return null

  const local = data.local?.services || {}
  const summary = data.platform?.summary
  const railway = data.platform?.railway

  let platformLabel = null
  let platformOk = null
  if (summary && summary.servicesTotal > 0) {
    platformLabel = `${summary.servicesHealthy}/${summary.servicesTotal}`
    platformOk = summary.servicesDegraded === 0 && summary.databaseOk !== false
  }

  const localDeps = ['postgres', 'redis', 'storage', 'scheduler']
  const localHealthy = localDeps.filter((k) => local[k]?.ok === true).length
  const localChecked = localDeps.filter((k) => local[k]?.ok !== null).length

  return {
    platformLabel,
    platformOk,
    localLabel: localChecked ? `${localHealthy}/${localChecked}` : null,
    localOk: localChecked > 0 && localHealthy === localChecked,
    eventBusDlq: data.platform?.eventBus?.dlqDepth ?? null,
    eventBusMode: data.platform?.eventBus?.mode ?? null,
    railwayEnv: railway?.environment || null,
    railwayConfigured: Boolean(railway?.configured),
    processRssMb: data.platform?.process?.rssMb ?? null,
    stub: Boolean(data.stub),
  }
}

/**
 * @param {Array<{ id: string; ok?: boolean|null; detail?: string; latencyMs?: number|null }>} services
 */
export function listPlatformServiceRows(services) {
  if (!Array.isArray(services)) return []
  return services.map((s) => ({
    id: s.id,
    ok: s.ok ?? null,
    detail: s.detail || '—',
    latencyMs: s.latencyMs ?? null,
  }))
}
