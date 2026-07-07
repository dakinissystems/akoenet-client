function getStorageKey(userId) {
  return `akoenet_voice_settings_${userId || 'anon'}`
}

function getLegacyStorageKeys(userId) {
  const uid = userId || 'anon'
  return [
    `akoe:voice:settings:${uid}`,
    `akonet_voice_settings_${uid}`,
    `Akonet_voice_settings_${uid}`,
  ]
}

function readSettings(userId) {
  const fallback = {
    micGain: 100,
    monitorMic: false,
    startWithCamera: false,
    startMuted: false,
    startDeafened: false,
  }
  try {
    let raw = localStorage.getItem(getStorageKey(userId))
    if (!raw) {
      const legacyKeys = getLegacyStorageKeys(userId)
      for (const legacyKey of legacyKeys) {
        raw = localStorage.getItem(legacyKey)
        if (raw) break
      }
    }
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const gain = Number(parsed?.micGain)
    if (!Number.isFinite(gain)) return fallback
    return {
      micGain: Math.max(0, Math.min(200, Math.round(gain))),
      monitorMic: typeof parsed?.monitorMic === 'boolean' ? parsed.monitorMic : false,
      startWithCamera:
        typeof parsed?.startWithCamera === 'boolean'
          ? parsed.startWithCamera
          : typeof parsed?.cameraEnabled === 'boolean'
            ? parsed.cameraEnabled
            : false,
      startMuted: typeof parsed?.startMuted === 'boolean' ? parsed.startMuted : false,
      startDeafened: typeof parsed?.startDeafened === 'boolean' ? parsed.startDeafened : false,
    }
  } catch {
    return fallback
  }
}

export function getSavedVoiceSettings(userId) {
  return readSettings(userId)
}
