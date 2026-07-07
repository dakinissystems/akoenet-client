import { reportError } from './reportError'

const fallbackIceServers = [{ urls: 'stun:stun.l.google.com:19302' }]

export function getRtcConfig() {
  const raw = import.meta.env.VITE_ICE_SERVERS
  if (!raw) return { iceServers: fallbackIceServers }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { iceServers: parsed }
    }
  } catch {
    /* fallback to default STUN */
  }
  return { iceServers: fallbackIceServers }
}

export function isScreenVideoTrack(track) {
  if (!track || track.kind !== 'video') return false
  const l = (track.label || '').toLowerCase()
  if (l.includes('screen') || l.includes('display') || l.includes('monitor') || l.includes('window'))
    return true
  try {
    const s = track.getSettings()
    if (s.displaySurface) return true
  } catch {
    /* ignore */
  }
  return false
}

export function splitScreenCameraStreams(stream) {
  if (!stream) return { screen: null, camera: null }
  const tracks = stream.getVideoTracks().filter((t) => t.readyState === 'live')
  const screenT = tracks.find((t) => isScreenVideoTrack(t))
  const cameraT = tracks.find((t) => t !== screenT) || (!screenT && tracks[0] ? tracks[0] : null)
  return {
    screen: screenT ? new MediaStream([screenT]) : null,
    camera: cameraT ? new MediaStream([cameraT]) : null,
  }
}

export function computeRemoteVideoLayout(stream, omitScreen) {
  if (!stream) return { screen: null, camera: null }
  const { screen, camera } = splitScreenCameraStreams(stream)
  return {
    screen: omitScreen ? null : screen,
    camera,
  }
}

export function readStoredRemoteVolumes(volumeStorageKey, legacyVolumeStorageKeys) {
  try {
    let raw = localStorage.getItem(volumeStorageKey)
    if (!raw) {
      for (const lk of legacyVolumeStorageKeys) {
        raw = localStorage.getItem(lk)
        if (raw) break
      }
    }
    const parsed = raw ? JSON.parse(raw) : {}
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    /* ignore */
  }
  return {}
}

export function computeLevel(analyser, dataArray) {
  analyser.getByteTimeDomainData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i += 1) {
    const centered = (dataArray[i] - 128) / 128
    sum += centered * centered
  }
  return Math.sqrt(sum / dataArray.length)
}

export function getVoiceParticipantInitial(name) {
  return (name || '?').slice(0, 1).toUpperCase()
}

export function streamHasScreenShare(stream) {
  if (!stream) return false
  return stream
    .getVideoTracks()
    .some((t) => t.readyState === 'live' && t.enabled && isScreenVideoTrack(t))
}

/** Mic + separate screen-audio track (typical when peer shares a tab with audio). */
export function remoteStreamHasSplittableScreenAudio(stream) {
  if (!stream || !streamHasScreenShare(stream)) return false
  return stream.getAudioTracks().filter((t) => t.readyState === 'live').length >= 2
}

export function streamHasCameraPip(stream) {
  const { camera } = splitScreenCameraStreams(stream)
  if (!camera) return false
  return camera.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled)
}

/** True if WebRTC stream is sending a visible video track (not audio-only / black). */
export function streamHasLiveVideo(stream) {
  if (!stream) return false
  return stream.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled)
}

/** True if the tile should show a video element (respects omitScreen for focus layout). */
export function streamShowsVideoInTile(stream, omitScreen) {
  if (!stream) return false
  if (omitScreen) {
    const { camera } = splitScreenCameraStreams(stream)
    return (
      camera &&
      camera.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled)
    )
  }
  return streamHasLiveVideo(stream)
}

export function voiceCapNumber(raw) {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return null
  return Math.min(99, Math.floor(n))
}
