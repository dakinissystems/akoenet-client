import { Capacitor } from '@capacitor/core'
import { isCapacitorNative } from '../lib/mobile-runtime'

/**
 * Solicita acceso a micrófono (y opcionalmente cámara) en WebView/Capacitor.
 * En Android requiere RECORD_AUDIO en el manifest y permiso en tiempo de ejecución.
 */
export async function ensureVoiceMediaPermissions({ camera = false } = {}) {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { granted: false, reason: 'unsupported' }
  }

  if (!isCapacitorNative() && Capacitor.getPlatform() === 'web') {
    return { granted: true }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: camera
        ? {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        : false
    })
    stream.getTracks().forEach((track) => track.stop())
    return { granted: true }
  } catch (err) {
    const name = String(err?.name || '')
    return { granted: false, reason: name, error: err }
  }
}
