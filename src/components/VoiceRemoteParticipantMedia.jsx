import { useEffect, useState } from 'react'
import { buildRemoteVoicePlaybackGraph, partitionVoiceAndScreenAudio } from '../lib/voiceConstraints'
import { reportError } from '../lib/reportError'
import { computeRemoteVideoLayout, splitScreenCameraStreams } from '../lib/voiceRoomUtils'

function connectProcessedPlayback(ctx, mediaStream, cleanupRef) {
  if (cleanupRef.current) {
    try {
      cleanupRef.current()
    } catch {
      /* ignore */
    }
    cleanupRef.current = null
  }
  if (!mediaStream || mediaStream.getAudioTracks().length === 0) {
    return null
  }
  const { playbackStream, disconnect } = buildRemoteVoicePlaybackGraph(ctx, mediaStream)
  cleanupRef.current = disconnect
  return playbackStream
}

/** Remote voice: voice + optional screen-share audio (separate mute); video split screen + camera pip. */
export default function VoiceRemoteParticipantMedia({
  stream,
  volume,
  mutedByDeafen,
  screenAudioMutedByUser = false,
  onAudioRef,
  omitScreen,
  getAudioContext,
}) {
  const voiceAudioRef = useRef(null)
  const screenAudioRef = useRef(null)
  const screenVideoRef = useRef(null)
  const cameraVideoRef = useRef(null)
  const [videoLayout, setVideoLayout] = useState({ screen: null, camera: null })
  const voicePlaybackCleanupRef = useRef(null)
  const screenPlaybackCleanupRef = useRef(null)
  const [audioTrackEpoch, setAudioTrackEpoch] = useState(0)
  const [layoutStreamSync, setLayoutStreamSync] = useState(stream)
  const [layoutOmitScreenSync, setLayoutOmitScreenSync] = useState(omitScreen)

  if (stream !== layoutStreamSync || omitScreen !== layoutOmitScreenSync) {
    setLayoutStreamSync(stream)
    setLayoutOmitScreenSync(omitScreen)
    setVideoLayout(computeRemoteVideoLayout(stream, omitScreen))
  }

  useEffect(() => {
    if (!stream) return undefined
    const bump = () => setAudioTrackEpoch((e) => e + 1)
    stream.addEventListener('addtrack', bump)
    stream.addEventListener('removetrack', bump)
    return () => {
      stream.removeEventListener('addtrack', bump)
      stream.removeEventListener('removetrack', bump)
    }
  }, [stream])

  useLayoutEffect(() => {
    const voiceEl = voiceAudioRef.current
    const screenEl = screenAudioRef.current
    if (!stream) {
      if (voicePlaybackCleanupRef.current) {
        voicePlaybackCleanupRef.current()
        voicePlaybackCleanupRef.current = null
      }
      if (screenPlaybackCleanupRef.current) {
        screenPlaybackCleanupRef.current()
        screenPlaybackCleanupRef.current = null
      }
      if (voiceEl) voiceEl.srcObject = null
      if (screenEl) screenEl.srcObject = null
      return undefined
    }
    if (!voiceEl) return undefined

    if (voicePlaybackCleanupRef.current) {
      voicePlaybackCleanupRef.current()
      voicePlaybackCleanupRef.current = null
    }
    if (screenPlaybackCleanupRef.current) {
      screenPlaybackCleanupRef.current()
      screenPlaybackCleanupRef.current = null
    }
    if (voiceEl) voiceEl.srcObject = null
    if (screenEl) screenEl.srcObject = null

    const { voiceStream, screenStream } = partitionVoiceAndScreenAudio(stream)
    const ctx = getAudioContext?.()

    if (!ctx) {
      if (voiceStream.getAudioTracks().length > 0) {
        voiceEl.srcObject = voiceStream
        void voiceEl.play()?.catch((err) => reportError('voice.playRemoteVoice', err))
      }
      if (screenEl && screenStream && screenStream.getAudioTracks().length > 0) {
        screenEl.srcObject = screenStream
        void screenEl.play()?.catch((err) => reportError('voice.playRemoteScreen', err))
      }
      return undefined
    }

    const vPlay = connectProcessedPlayback(ctx, voiceStream, voicePlaybackCleanupRef)
    if (voiceEl) {
      if (vPlay && vPlay.getAudioTracks().length > 0) {
        voiceEl.srcObject = vPlay
      } else if (voiceStream.getAudioTracks().length > 0) {
        voiceEl.srcObject = voiceStream
      }
      void voiceEl.play()?.catch((err) => reportError('voice.playProcessedRemoteVoice', err))
    }

    if (screenEl && screenStream && screenStream.getAudioTracks().length > 0) {
      const sPlay = connectProcessedPlayback(ctx, screenStream, screenPlaybackCleanupRef)
      screenEl.srcObject =
        sPlay && sPlay.getAudioTracks().length > 0 ? sPlay : screenStream
      void screenEl.play()?.catch((err) => reportError('voice.playProcessedRemoteScreen', err))
    }

    return () => {
      if (voicePlaybackCleanupRef.current) {
        voicePlaybackCleanupRef.current()
        voicePlaybackCleanupRef.current = null
      }
      if (screenPlaybackCleanupRef.current) {
        screenPlaybackCleanupRef.current()
        screenPlaybackCleanupRef.current = null
      }
    }
  }, [stream, audioTrackEpoch, getAudioContext])

  useEffect(() => {
    const v = voiceAudioRef.current
    const s = screenAudioRef.current
    const vol = volume / 100
    if (v) {
      v.volume = vol
      v.muted = Boolean(mutedByDeafen)
    }
    if (s) {
      s.volume = vol
      s.muted = Boolean(mutedByDeafen) || Boolean(screenAudioMutedByUser)
    }
  }, [volume, mutedByDeafen, screenAudioMutedByUser])

  useEffect(() => {
    if (!stream) return undefined
    const sync = () => {
      const layout = computeRemoteVideoLayout(stream, omitScreen)
      setVideoLayout(layout)
      const sv = screenVideoRef.current
      const cv = cameraVideoRef.current
      if (sv) {
        sv.srcObject = layout.screen
        if (layout.screen) {
          const p = sv.play()
          if (p !== undefined) p.catch((err) => reportError('voice.playRemoteScreenVideo', err))
        }
      }
      if (cv) {
        cv.srcObject = layout.camera
        if (layout.camera) {
          const p = cv.play()
          if (p !== undefined) p.catch((err) => reportError('voice.playRemoteCameraVideo', err))
        }
      }
    }
    sync()
    stream.addEventListener('addtrack', sync)
    stream.addEventListener('removetrack', sync)
    return () => {
      stream.removeEventListener('addtrack', sync)
      stream.removeEventListener('removetrack', sync)
    }
  }, [stream, omitScreen])

  if (!stream) return null

  return (
    <>
      <audio
        ref={(el) => {
          voiceAudioRef.current = el
          onAudioRef?.(el)
        }}
        autoPlay
        className="voice-remote-audio-el"
        aria-label="Remote voice"
        tabIndex={-1}
      >
        <track kind="captions" />
      </audio>
      <audio
        ref={screenAudioRef}
        autoPlay
        className="voice-remote-audio-el voice-remote-screen-audio-el"
        aria-label="Remote screen audio"
        tabIndex={-1}
      >
        <track kind="captions" />
      </audio>
      {(videoLayout.screen || videoLayout.camera) && (
        <div className="voice-remote-video-stack">
          {videoLayout.screen && (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted
              className="voice-remote-media voice-remote-screen"
              aria-label="Remote screen share"
            />
          )}
          {videoLayout.camera && (
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className={`voice-remote-media ${videoLayout.screen ? 'voice-remote-camera-pip' : 'has-video'}`}
              aria-label="Remote camera"
            />
          )}
        </div>
      )}
    </>
  )
}
