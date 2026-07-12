const STORAGE_PREFIX = 'akoenet.ws.layout.'

export function defaultLayoutForWindows(addonId, windowIds) {
  const cols = 2
  const baseX = 48
  const baseY = 56
  const gap = 16
  const w = 300
  const h = 220
  return windowIds.map((id, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      id,
      visible: i < 4,
      minimized: false,
      zIndex: 10 + i,
      rect: {
        x: baseX + col * (w + gap),
        y: baseY + row * (h + gap),
        width: w,
        height: h,
      },
    }
  })
}

export function loadAddonLayout(addonId, windowIds) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${addonId}`)
    if (!raw) return defaultLayoutForWindows(addonId, windowIds)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultLayoutForWindows(addonId, windowIds)
    const known = new Set(windowIds)
    const filtered = parsed.filter((w) => known.has(w.id))
    const missing = windowIds.filter((id) => !filtered.some((w) => w.id === id))
    if (missing.length) {
      return [...filtered, ...defaultLayoutForWindows(addonId, missing).filter((w) => missing.includes(w.id))]
    }
    return filtered.length ? filtered : defaultLayoutForWindows(addonId, windowIds)
  } catch {
    return defaultLayoutForWindows(addonId, windowIds)
  }
}

export function persistAddonLayout(addonId, windows) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${addonId}`, JSON.stringify(windows))
  } catch {
    /* ignore */
  }
}
