import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useEffectEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { getSocket } from '../services/socket'
import {
  buildRemoteVoicePlaybackGraph,
  buildVoiceOutgoingGraph,
  getVoiceChannelAudioConstraints,
  getVoiceVideoConstraints,
  getMicTestAudioConstraints,
  getScreenShareConstraints,
  partitionVoiceAndScreenAudio,
} from '../lib/voiceConstraints'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { getSavedVoiceSettings } from '../lib/voiceSettings'
import { reportError } from '../lib/reportError'
import VoiceRemoteParticipantMedia from '../components/VoiceRemoteParticipantMedia'
import {
  IconHeadphones,
  IconHeadphonesDeafened,
  IconJoinCall,
  IconMic,
  IconMicMuted,
  IconScreenShare,
  IconTestMic,
  IconVideo,
  IconVideoOff,
  IconVolume,
  IconWaveSpeaking,
  PhoneHangupIcon,
  VoiceToolbarBtn,
} from '../components/VoiceRoomIcons'
import {
  computeLevel,
  computeRemoteVideoLayout,
  getRtcConfig,
  getVoiceParticipantInitial,
  isScreenVideoTrack,
  readStoredRemoteVolumes,
  remoteStreamHasSplittableScreenAudio,
  splitScreenCameraStreams,
  streamHasCameraPip,
  streamHasLiveVideo,
  streamHasScreenShare,
  streamShowsVideoInTile,
  voiceCapNumber,
} from '../lib/voiceRoomUtils'
import { VOICE_SESSION_IDLE, voiceSessionReducer } from '../lib/voiceRoomSession'

const rtcConfig = getRtcConfig()
const VOICE_JOIN_ACK_MS = 20_000

function waitForSocketConnected(socket, timeoutMs = VOICE_JOIN_ACK_MS) {
  if (!socket) return Promise.resolve(false)
  if (socket.connected) return Promise.resolve(true)
  return new Promise((resolve) => {
    let settled = false
    const finish = (ok) => {
      if (settled) return
      settled = true
      socket.off('connect', onConnect)
      window.clearTimeout(timer)
      resolve(ok)
    }
    const onConnect = () => finish(true)
    const timer = window.setTimeout(() => finish(false), timeoutMs)
    socket.on('connect', onConnect)
  })
}

function voiceJoinErrorMessage(tr, err) {
  switch (err) {
    case 'voice_full':
      return tr('voiceRoom.errVoiceFull')
    case 'forbidden':
      return tr('voiceRoom.errJoinForbidden')
    case 'timeout':
      return tr('voiceRoom.errJoinTimeout')
    case 'server_error':
      return tr('voiceRoom.errJoinServer')
    default:
      return tr('voiceRoom.errJoinVoice')
  }
}

export function useVoiceRoom({
  channelId,
  user,
  autoJoin = false,
  compact = false,
  channelLabel,
  voiceUserLimit,
  voiceConnectedCount,
  onVoiceSessionChange,
}) {
  const { t: tr } = useTranslation()
  const [voiceSession, dispatchVoiceSession] = useReducer(voiceSessionReducer, VOICE_SESSION_IDLE)
  const {
    joined,
    participants,
    muted,
    deafened,
    speakingMap,
    remoteStreams,
    cameraOn,
    screenSharing,
    localScreenStream,
    remoteScreenAudioMuted,
  } = voiceSession
  const patchVoiceSession = useCallback((patch) => {
    dispatchVoiceSession({ type: 'patch', patch })
  }, [])
  const setJoined = useCallback(
    (value) => patchVoiceSession((s) => ({ joined: typeof value === 'function' ? value(s.joined) : value })),
    [patchVoiceSession]
  )
  const setParticipants = useCallback(
    (value) =>
      patchVoiceSession((s) => ({
        participants: typeof value === 'function' ? value(s.participants) : value,
      })),
    [patchVoiceSession]
  )
  const setMuted = useCallback(
    (value) => patchVoiceSession((s) => ({ muted: typeof value === 'function' ? value(s.muted) : value })),
    [patchVoiceSession]
  )
  const setDeafened = useCallback(
    (value) =>
      patchVoiceSession((s) => ({ deafened: typeof value === 'function' ? value(s.deafened) : value })),
    [patchVoiceSession]
  )
  const setSpeakingMap = useCallback(
    (value) =>
      patchVoiceSession((s) => ({
        speakingMap: typeof value === 'function' ? value(s.speakingMap) : value,
      })),
    [patchVoiceSession]
  )
  const setRemoteStreams = useCallback(
    (value) =>
      patchVoiceSession((s) => ({
        remoteStreams: typeof value === 'function' ? value(s.remoteStreams) : value,
      })),
    [patchVoiceSession]
  )
  const setCameraOn = useCallback(
    (value) =>
      patchVoiceSession((s) => ({ cameraOn: typeof value === 'function' ? value(s.cameraOn) : value })),
    [patchVoiceSession]
  )
  const setScreenSharing = useCallback(
    (value) =>
      patchVoiceSession((s) => ({
        screenSharing: typeof value === 'function' ? value(s.screenSharing) : value,
      })),
    [patchVoiceSession]
  )
  const setLocalScreenStream = useCallback(
    (value) =>
      patchVoiceSession((s) => ({
        localScreenStream: typeof value === 'function' ? value(s.localScreenStream) : value,
      })),
    [patchVoiceSession]
  )
  const setRemoteScreenAudioMuted = useCallback(
    (value) =>
      patchVoiceSession((s) => ({
        remoteScreenAudioMuted:
          typeof value === 'function' ? value(s.remoteScreenAudioMuted) : value,
      })),
    [patchVoiceSession]
  )
  const [testingMic, setTestingMic] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [remoteVolumes, setRemoteVolumes] = useState({})
  const [remoteAvatarFailed, setRemoteAvatarFailed] = useState(() => new Set())
  /** Which shared screen is shown large: 'local' or a remote socketId; null when none sharing. */
  const [screenFocusId, setScreenFocusId] = useState(null)
  const [localScreenAudioSendMuted, setLocalScreenAudioSendMuted] = useState(false)
  const [localScreenPreviewMuted, setLocalScreenPreviewMuted] = useState(false)
  const localStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const localScreenVideoRef = useRef(null)
  const localPipVideoRef = useRef(null)
  const screenFocusVideoRef = useRef(null)
  const screenFocusShellRef = useRef(null)
  const screenFocusPipVideoRef = useRef(null)
  const screenShareStreamRef = useRef(null)
  const screenTrackRef = useRef(null)
  /** Audio tracks from getDisplayMedia (tab/system); empty if browser shares video only. */
  const screenShareAudioTracksRef = useRef([])
  const localScreenShareAudioPreviewRef = useRef(null)
  const micTestStreamRef = useRef(null)
  const peersRef = useRef(null)
  const remoteMediaRef = useRef(null)
  const audioContextRef = useRef(null)
  const localAnalyserRef = useRef(null)
  const localDataRef = useRef(null)
  const remoteAnalysersRef = useRef(null)
  if (peersRef.current == null) peersRef.current = new Map()
  if (remoteMediaRef.current == null) remoteMediaRef.current = new Map()
  if (remoteAnalysersRef.current == null) remoteAnalysersRef.current = new Map()
  const meterIntervalRef = useRef(null)
  const micGainRef = useRef(100)
  const voiceJoinedChannelRef = useRef(null)
  const joinInProgressRef = useRef(false)
  const joinGenerationRef = useRef(0)
  const lastScreenShareIdsKeyRef = useRef('')
  const rawVoiceStreamRef = useRef(null)
  const outgoingGainNodeRef = useRef(null)
  const voiceOutgoingDisconnectRef = useRef(null)
  const pendingAudioCtxCloseRef = useRef(null)
  const leaveVoiceRef = useRef(() => {})
  const joinVoiceRef = useRef(() => {})
  const joinedRef = useRef(false)
  const upsertParticipantRef = useRef(() => {})
  const removeParticipantRef = useRef(() => {})
  const playVoiceJoinChimeRef = useRef(() => {})
  const handleSignalRef = useRef(() => {})

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      audioContextRef.current = new Ctx()
    }
    return audioContextRef.current
  }, [])

  function teardownVoiceOutgoingProcessing() {
    try {
      voiceOutgoingDisconnectRef.current?.()
    } catch {
      /* ignore */
    }
    voiceOutgoingDisconnectRef.current = null
    outgoingGainNodeRef.current = null
  }

  const volumeStorageKey = `akoenet_voice_volumes_${user?.id || 'anon'}_${channelId || 'none'}`
  const legacyVolumeStorageKeys = useMemo(
    () => [
      `Akonet_voice_volumes_${user?.id || 'anon'}_${channelId || 'none'}`,
      `akonet_voice_volumes_${user?.id || 'anon'}_${channelId || 'none'}`,
      `akoe:voice:volumes:${user?.id || 'anon'}:${channelId || 'none'}`,
    ],
    [user?.id, channelId]
  )
  const [volumeKeySync, setVolumeKeySync] = useState(volumeStorageKey)

  if (volumeStorageKey !== volumeKeySync) {
    setVolumeKeySync(volumeStorageKey)
    setRemoteVolumes(readStoredRemoteVolumes(volumeStorageKey, legacyVolumeStorageKeys))
  }

  const screenShareOptions = useMemo(() => {
    const opts = []
    if (joined && screenSharing && localScreenStream && streamHasScreenShare(localScreenStream)) {
      opts.push({ key: 'local', label: tr('voiceRoom.yourScreen') })
    }
    const socket = getSocket()
    const selfSid = socket?.id
    for (const p of participants) {
      if (p.socketId === selfSid) continue
      const rs = remoteStreams[p.socketId]
      if (streamHasScreenShare(rs)) {
        opts.push({ key: p.socketId, label: p.username })
      }
    }
    return opts
  }, [joined, screenSharing, localScreenStream, participants, remoteStreams, tr])

  const resolvedScreenFocusId = useMemo(() => {
    if (screenShareOptions.length === 0) return null
    if (screenFocusId && screenShareOptions.some((o) => o.key === screenFocusId)) return screenFocusId
    return screenShareOptions[0].key
  }, [screenShareOptions, screenFocusId])

  const mediaSyncRef = useRef({})
  mediaSyncRef.current = {
    resolvedScreenFocusId,
    screenShareOptions,
    localScreenStream,
    remoteStreams,
    cameraOn,
    joined,
    screenSharing,
    localScreenPreviewMuted,
    remoteVolumes,
  }

  const voiceScreenSyncRef = useRef({})
  voiceScreenSyncRef.current = {
    joined,
    participants,
    userId: user?.id,
    onVoiceSessionChange,
  }

  const syncVoiceSessionScreenSharing = useCallback(() => {
    const session = mediaSyncRef.current
    const voiceScreen = voiceScreenSyncRef.current
    if (!voiceScreen.joined || !voiceScreen.onVoiceSessionChange) {
      if (!voiceScreen.joined) lastScreenShareIdsKeyRef.current = ''
      return
    }
    const socket = getSocket()
    const selfSid = socket?.id
    const ids = []
    if (
      session.screenSharing &&
      session.localScreenStream &&
      streamHasScreenShare(session.localScreenStream) &&
      voiceScreen.userId != null
    ) {
      ids.push(Number(voiceScreen.userId))
    }
    for (const p of voiceScreen.participants) {
      if (p.socketId === selfSid) continue
      if (streamHasScreenShare(session.remoteStreams[p.socketId]) && p.userId != null) {
        ids.push(Number(p.userId))
      }
    }
    const key = ids.map(String).sort().join(',')
    if (key === lastScreenShareIdsKeyRef.current) return
    lastScreenShareIdsKeyRef.current = key
    voiceScreen.onVoiceSessionChange({ screenSharingUserIds: ids })
  }, [])

  const applyScreenFocusVideo = useCallback((focusId = mediaSyncRef.current.resolvedScreenFocusId) => {
    const { screenShareOptions: opts, localScreenStream: localScreen, remoteStreams: remotes } =
      mediaSyncRef.current
    const el = screenFocusVideoRef.current
    if (!el) return
    if (!focusId || opts.length === 0) {
      el.srcObject = null
      return
    }
    const screenStream =
      focusId === 'local'
        ? splitScreenCameraStreams(localScreen).screen
        : splitScreenCameraStreams(remotes[focusId]).screen
    el.srcObject = screenStream
    if (screenStream) {
      const p = el.play()
      if (p !== undefined) p.catch(() => {})
    }
  }, [])

  const applyScreenFocusPipVideo = useCallback((focusId = mediaSyncRef.current.resolvedScreenFocusId) => {
    const { screenShareOptions: opts, remoteStreams: remotes, cameraOn: camOn } = mediaSyncRef.current
    const el = screenFocusPipVideoRef.current
    if (!el) return
    if (!focusId || opts.length === 0) {
      el.srcObject = null
      return
    }
    if (focusId === 'local') {
      if (camOn && localStreamRef.current) {
        const vts = localStreamRef.current.getVideoTracks().filter((t) => t.readyState === 'live')
        el.srcObject = vts.length ? new MediaStream(vts) : null
      } else {
        el.srcObject = null
      }
      return
    }
    const { camera } = splitScreenCameraStreams(remotes[focusId])
    el.srcObject = camera
  }, [])

  const applyLocalVideoElements = useCallback((focusId = mediaSyncRef.current.resolvedScreenFocusId) => {
    const { joined: isJoined, cameraOn: camOn, screenSharing: sharing, localScreenStream: localScreen } =
      mediaSyncRef.current
    const el = localVideoRef.current
    const s = localStreamRef.current
    if (el && s) {
      if (sharing && localScreen) {
        if (focusId === 'local' && camOn) {
          const vts = s.getVideoTracks().filter((t) => t.readyState === 'live')
          el.srcObject = vts.length ? new MediaStream(vts) : null
        } else {
          el.srcObject = null
        }
      } else {
        el.srcObject = s
      }
    }
    const screenEl = localScreenVideoRef.current
    if (screenEl) {
      if (sharing && localScreen && focusId !== 'local') {
        screenEl.srcObject = localScreen
      } else {
        screenEl.srcObject = null
      }
    }
    const pip = localPipVideoRef.current
    if (pip && localStreamRef.current) {
      if (sharing && camOn && focusId !== 'local') {
        const vts = localStreamRef.current.getVideoTracks().filter((t) => t.readyState === 'live')
        pip.srcObject = vts.length ? new MediaStream(vts) : null
      } else {
        pip.srcObject = null
      }
    }
    void isJoined
  }, [])

  const applyRemoteVolumeElements = useCallback(() => {
    const { remoteVolumes: volumes } = mediaSyncRef.current
    remoteMediaRef.current.forEach((el, socketId) => {
      const v = volumes[socketId]
      if (typeof v === 'number') el.volume = v / 100
    })
  }, [])

  const applyLocalScreenAudioPreview = useCallback(() => {
    const { screenSharing: sharing, localScreenStream: localScreen, localScreenPreviewMuted: previewMuted } =
      mediaSyncRef.current
    const el = localScreenShareAudioPreviewRef.current
    if (!el || !sharing || !localScreen) {
      if (el) el.srcObject = null
      return
    }
    const tracks = localScreen.getAudioTracks().filter((t) => t.readyState === 'live')
    if (tracks.length === 0) {
      el.srcObject = null
      return
    }
    el.srcObject = new MediaStream(tracks)
    el.muted = previewMuted
    const p = el.play()
    if (p !== undefined) p.catch((err) => reportError('voice.playLocalScreenAudioPreview', err))
  }, [])

  const refreshVoiceMediaElements = useCallback(() => {
    applyScreenFocusVideo()
    applyScreenFocusPipVideo()
    applyLocalVideoElements()
    applyRemoteVolumeElements()
    applyLocalScreenAudioPreview()
    syncVoiceSessionScreenSharing()
  }, [
    applyScreenFocusVideo,
    applyScreenFocusPipVideo,
    applyLocalVideoElements,
    applyRemoteVolumeElements,
    applyLocalScreenAudioPreview,
    syncVoiceSessionScreenSharing,
  ])

  /**
   * Chrome suele recortar mal getDisplayMedia si solo usamos CSS (object-fit + %).
   * Dimensionamos el <video> en px con el aspecto real (videoWidth/videoHeight) para que quepa en el shell.
   */
  useEffect(() => {
    const video = screenFocusVideoRef.current
    const shell = screenFocusShellRef.current
    if (!video || !shell || !resolvedScreenFocusId || screenShareOptions.length === 0) return undefined

    function fit() {
      const v = screenFocusVideoRef.current
      const s = screenFocusShellRef.current
      if (!v || !s) return
      const vw = v.videoWidth
      const vh = v.videoHeight
      if (!vw || !vh) {
        v.style.removeProperty('width')
        v.style.removeProperty('height')
        v.style.removeProperty('object-fit')
        return
      }
      const cr = s.getBoundingClientRect()
      const cw = cr.width
      const ch = cr.height
      if (cw < 2 || ch < 2) return
      const scale = Math.min(cw / vw, ch / vh)
      const w = Math.max(1, Math.round(vw * scale * 1000) / 1000)
      const h = Math.max(1, Math.round(vh * scale * 1000) / 1000)
      v.style.width = `${w}px`
      v.style.height = `${h}px`
      v.style.objectFit = 'fill'
    }

    const scheduleFit = () => {
      requestAnimationFrame(fit)
    }

    video.addEventListener('loadedmetadata', scheduleFit)
    video.addEventListener('loadeddata', scheduleFit)
    video.addEventListener('canplay', scheduleFit)
    window.addEventListener('resize', scheduleFit)

    const ro = new ResizeObserver(scheduleFit)
    ro.observe(shell)

    let track
    const { srcObject } = video
    if (srcObject && typeof MediaStream !== 'undefined' && srcObject instanceof MediaStream) {
      track = srcObject.getVideoTracks()[0]
      if (track) track.addEventListener('resize', scheduleFit)
    }

    scheduleFit()
    const t1 = setTimeout(scheduleFit, 80)
    const t2 = setTimeout(scheduleFit, 350)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      video.removeEventListener('loadedmetadata', scheduleFit)
      video.removeEventListener('loadeddata', scheduleFit)
      video.removeEventListener('canplay', scheduleFit)
      window.removeEventListener('resize', scheduleFit)
      ro.disconnect()
      if (track) track.removeEventListener('resize', scheduleFit)
      video.style.removeProperty('width')
      video.style.removeProperty('height')
      video.style.removeProperty('object-fit')
    }
  }, [resolvedScreenFocusId, screenShareOptions.length, localScreenStream, remoteStreams])

  useEffect(() => {
    const s = getSavedVoiceSettings(user?.id)
    micGainRef.current = s.micGain
  }, [user?.id])

  useEffect(() => {
    if (!joined) return undefined
    const syncMicGain = () => {
      const g = getSavedVoiceSettings(user?.id).micGain
      micGainRef.current = g
      if (outgoingGainNodeRef.current) {
        outgoingGainNodeRef.current.gain.value = Math.max(0, Math.min(2, g / 100))
      }
    }
    syncMicGain()
    const id = window.setInterval(syncMicGain, 500)
    return () => window.clearInterval(id)
  }, [joined, user?.id])

  function upsertParticipant(participant) {
    setParticipants((prev) => {
      const exists = prev.some((p) => p.socketId === participant.socketId)
      if (exists) {
        return prev.map((p) => (p.socketId === participant.socketId ? participant : p))
      }
      return [...prev, participant]
    })
    setRemoteVolumes((prev) => {
      if (prev[participant.socketId] !== undefined) return prev
      return { ...prev, [participant.socketId]: 100 }
    })
  }
  upsertParticipantRef.current = upsertParticipant

  function removeParticipant(socketId) {
    setParticipants((prev) => prev.filter((p) => p.socketId !== socketId))
    setRemoteStreams((prev) => {
      const next = { ...prev }
      delete next[socketId]
      return next
    })
    remoteAnalysersRef.current.delete(socketId)
    setSpeakingMap((prev) => {
      const next = { ...prev }
      delete next[socketId]
      return next
    })
    setScreenFocusId((prev) => (prev === socketId ? null : prev))
    setRemoteScreenAudioMuted((prev) => {
      if (prev[socketId] === undefined) return prev
      const next = { ...prev }
      delete next[socketId]
      return next
    })
    requestAnimationFrame(refreshVoiceMediaElements)
  }
  removeParticipantRef.current = removeParticipant

  function attachRemoteStream(socketId, stream) {
    setRemoteStreams((prev) => ({ ...prev, [socketId]: stream }))
    setupRemoteAnalyser(socketId, stream)
    requestAnimationFrame(refreshVoiceMediaElements)
  }

  /** Short chime for other participants when someone joins the voice channel (not played to the joiner). */
  function playVoiceJoinChime() {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const run = () => {
      const t0 = ctx.currentTime
      const dur = 0.22
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, t0)
      osc.frequency.exponentialRampToValueAtTime(1320, t0 + 0.07)
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.1, t0 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + dur)
    }
    if (ctx.state === 'suspended') {
      void ctx.resume().then(run).catch((err) => reportError('voice.resumeAudioContext', err))
    } else {
      run()
    }
  }
  playVoiceJoinChimeRef.current = playVoiceJoinChime

  function startMeterLoop() {
    if (meterIntervalRef.current) return
    meterIntervalRef.current = window.setInterval(() => {
      let nextMicLevel = 0
      if (localAnalyserRef.current && localDataRef.current) {
        nextMicLevel = computeLevel(localAnalyserRef.current, localDataRef.current)
      }
      setMicLevel(Math.min(1, nextMicLevel * 4))

      const nextSpeaking = {}
      remoteAnalysersRef.current.forEach((entry, socketId) => {
        const level = computeLevel(entry.analyser, entry.dataArray)
        nextSpeaking[socketId] = level > 0.03
      })
      setSpeakingMap(nextSpeaking)
    }, 120)
  }

  function stopMeterLoop() {
    if (!meterIntervalRef.current) return
    window.clearInterval(meterIntervalRef.current)
    meterIntervalRef.current = null
  }

  function setupLocalAnalyser(stream) {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.5
    source.connect(analyser)
    localAnalyserRef.current = analyser
    localDataRef.current = new Uint8Array(analyser.fftSize)
    startMeterLoop()
  }

  function clearLocalMeter() {
    localAnalyserRef.current = null
    localDataRef.current = null
    setMicLevel(0)
    if (!remoteAnalysersRef.current.size) {
      stopMeterLoop()
    }
  }

  function setupRemoteAnalyser(socketId, stream) {
    if (remoteAnalysersRef.current.has(socketId)) return
    const ctx = ensureAudioContext()
    if (!ctx) return
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.5
    source.connect(analyser)
    remoteAnalysersRef.current.set(socketId, {
      analyser,
      dataArray: new Uint8Array(analyser.fftSize),
    })
    startMeterLoop()
  }

  function createPeer(targetSocketId, initiateOffer) {
    const socket = getSocket()
    if (!socket) return null
    if (peersRef.current.has(targetSocketId)) return peersRef.current.get(targetSocketId)

    const pc = new RTCPeerConnection(rtcConfig)
    peersRef.current.set(targetSocketId, pc)

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current)
      })
    }
    if (screenShareStreamRef.current && screenTrackRef.current) {
      const tr = screenTrackRef.current
      const ss = screenShareStreamRef.current
      if (tr.readyState === 'live') {
        pc.addTrack(tr, ss)
      }
    }
    screenShareAudioTracksRef.current.forEach((at) => {
      const ss = screenShareStreamRef.current
      if (ss && at.readyState === 'live') {
        pc.addTrack(at, ss)
      }
    })

    const remoteStream = new MediaStream()
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track))
      attachRemoteStream(targetSocketId, remoteStream)
    }
    pc.onicecandidate = (e) => {
      if (!e.candidate) return
      socket.emit('voice:signal', {
        channelId,
        targetSocketId,
        candidate: e.candidate,
      })
    }
    pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        pc.close()
        peersRef.current.delete(targetSocketId)
        removeParticipant(targetSocketId)
      }
    }

    if (initiateOffer) {
      ;(async () => {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('voice:signal', {
          channelId,
          targetSocketId,
          description: pc.localDescription,
        })
      })().catch((err) => reportError('voice.createOffer', err))
    }

    return pc
  }

  async function renegotiateAllPeers() {
    const socket = getSocket()
    if (!socket || !channelId) return
    const tasks = []
    peersRef.current.forEach((pc, targetSocketId) => {
      tasks.push(
        (async () => {
          try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit('voice:signal', {
              channelId,
              targetSocketId,
              description: pc.localDescription,
            })
          } catch {
            /* ignore */
          }
        })(),
      )
    })
    await Promise.all(tasks)
  }

  function cleanupScreenShareOnLeave() {
    const track = screenTrackRef.current
    const ss = screenShareStreamRef.current
    screenTrackRef.current = null
    screenShareStreamRef.current = null
    screenShareAudioTracksRef.current = []
    setLocalScreenStream(null)
    setScreenSharing(false)
    setLocalScreenAudioSendMuted(false)
    setLocalScreenPreviewMuted(false)
    if (localScreenShareAudioPreviewRef.current) {
      localScreenShareAudioPreviewRef.current.srcObject = null
    }
    if (track) {
      try {
        track.stop()
      } catch {
        /* ignore */
      }
    }
    if (ss) {
      ss.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {
          /* ignore */
        }
      })
    }
  }

  async function stopScreenShare() {
    const track = screenTrackRef.current
    if (!track) {
      setLocalScreenStream(null)
      setScreenSharing(false)
      screenShareAudioTracksRef.current = []
      return
    }
    const screenAudios = screenShareAudioTracksRef.current
    peersRef.current.forEach((pc) => {
      pc.getSenders().forEach((sender) => {
        const tr = sender.track
        if (!tr) return
        if (tr === track || screenAudios.includes(tr)) {
          pc.removeTrack(sender)
        }
      })
    })
    try {
      track.stop()
    } catch {
      /* ignore */
    }
    const ss = screenShareStreamRef.current
    screenTrackRef.current = null
    screenShareStreamRef.current = null
    screenShareAudioTracksRef.current = []
    setLocalScreenAudioSendMuted(false)
    setLocalScreenPreviewMuted(false)
    if (localScreenShareAudioPreviewRef.current) {
      localScreenShareAudioPreviewRef.current.srcObject = null
    }
    if (ss) {
      ss.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {
          /* ignore */
        }
      })
    }
    setLocalScreenStream(null)
    setScreenSharing(false)
    await renegotiateAllPeers()
  }

  async function toggleScreenShare() {
    if (!joined) return
    if (screenTrackRef.current) {
      await stopScreenShare()
      return
    }
    setError('')
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia(getScreenShareConstraints())
      const vt = screenStream.getVideoTracks()[0]
      if (!vt) {
        screenStream.getTracks().forEach((t) => t.stop())
        return
      }
      screenShareStreamRef.current = screenStream
      screenTrackRef.current = vt
      const audioTracks = screenStream.getAudioTracks()
      screenShareAudioTracksRef.current = audioTracks
      setLocalScreenAudioSendMuted(false)
      setLocalScreenStream(screenStream)
      setScreenSharing(true)
      vt.addEventListener('ended', () => {
        void stopScreenShare()
      })
      peersRef.current.forEach((pc) => {
        pc.addTrack(vt, screenStream)
        audioTracks.forEach((at) => {
          pc.addTrack(at, screenStream)
        })
      })
      await renegotiateAllPeers()
      requestAnimationFrame(refreshVoiceMediaElements)
    } catch {
      setError(tr('voiceRoom.errScreenCancelled'))
    }
  }

  joinedRef.current = joined

  async function handleSignal({ fromSocketId, description, candidate }) {
    const pc = createPeer(fromSocketId, false)
    if (!pc) return
    try {
      if (description) {
        await pc.setRemoteDescription(new RTCSessionDescription(description))
        if (description.type === 'offer') {
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          getSocket()?.emit('voice:signal', {
            channelId,
            targetSocketId: fromSocketId,
            description: pc.localDescription,
          })
        }
      } else if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    } catch {
      /* ignore transient RTC errors */
    }
  }
  handleSignalRef.current = handleSignal

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !channelId) return
    const onJoined = (participant) => {
      if (participant.socketId !== socket.id && joinedRef.current) {
        playVoiceJoinChimeRef.current()
      }
      upsertParticipantRef.current(participant)
    }
    const onLeft = ({ socketId }) => {
      removeParticipantRef.current(socketId)
      const pc = peersRef.current.get(socketId)
      if (pc) {
        pc.close()
        peersRef.current.delete(socketId)
      }
    }
    const onSignal = (payload) => {
      void handleSignalRef.current(payload)
    }
    socket.on('voice:user-joined', onJoined)
    socket.on('voice:user-left', onLeft)
    socket.on('voice:signal', onSignal)
    return () => {
      socket.off('voice:user-joined', onJoined)
      socket.off('voice:user-left', onLeft)
      socket.off('voice:signal', onSignal)
    }
  }, [channelId, joined])

  async function joinVoice(opts = {}) {
    const discordStyle = Boolean(opts.discordStyle)
    const socket = getSocket()
    if (!socket || !channelId) return
    if (voiceJoinedChannelRef.current === channelId && localStreamRef.current) {
      if (!joined) {
        setJoined(true)
        requestAnimationFrame(refreshVoiceMediaElements)
      }
      setJoining(false)
      return
    }
    if (joinInProgressRef.current) return

    const gen = ++joinGenerationRef.current
    const isStale = () => gen !== joinGenerationRef.current

    if (testingMic) {
      stopMicTest()
    }
    setError('')
    setJoining(true)
    joinInProgressRef.current = true

    let stream = null
    try {
      const connected = await waitForSocketConnected(socket)
      if (isStale()) return
      if (!connected) {
        setError(tr('voiceRoom.errJoinSocket'))
        return
      }

      const settings = getSavedVoiceSettings(user?.id)
      micGainRef.current = settings.micGain
      const wantVideo = Boolean(settings.startWithCamera)
      const startDeafened = Boolean(settings.startDeafened)
      const startMuted = startDeafened || Boolean(settings.startMuted)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: getVoiceChannelAudioConstraints(),
          video: wantVideo ? getVoiceVideoConstraints() : false,
        })
      } catch (firstErr) {
        if (wantVideo) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: getVoiceChannelAudioConstraints(),
              video: false,
            })
            setCameraOn(false)
          } catch {
            throw firstErr
          }
        } else {
          throw firstErr
        }
      }
      if (isStale()) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      rawVoiceStreamRef.current = stream
      if (pendingAudioCtxCloseRef.current) {
        clearTimeout(pendingAudioCtxCloseRef.current)
        pendingAudioCtxCloseRef.current = null
      }
      const ctx = ensureAudioContext()
      if (!ctx) {
        stream.getTracks().forEach((t) => t.stop())
        rawVoiceStreamRef.current = null
        setError(tr('voiceRoom.errNoAudio'))
        return
      }
      await ctx.resume()
      if (isStale()) {
        stream.getTracks().forEach((t) => t.stop())
        rawVoiceStreamRef.current = null
        return
      }

      const mediaSource = ctx.createMediaStreamSource(stream)
      const graph = buildVoiceOutgoingGraph(ctx, mediaSource, {
        micGainPercent: micGainRef.current,
      })
      voiceOutgoingDisconnectRef.current = graph.disconnect
      outgoingGainNodeRef.current = graph.gain
      localAnalyserRef.current = graph.analyser
      localDataRef.current = new Uint8Array(graph.analyser.fftSize)
      startMeterLoop()

      const processedAudioTrack = graph.destination.stream.getAudioTracks()[0]
      if (!processedAudioTrack) {
        teardownVoiceOutgoingProcessing()
        stream.getTracks().forEach((t) => t.stop())
        rawVoiceStreamRef.current = null
        setError(tr('voiceRoom.errMicProcess'))
        return
      }
      const localStream = new MediaStream([processedAudioTrack, ...stream.getVideoTracks()])
      localStreamRef.current = localStream

      const hasVideo = stream.getVideoTracks().length > 0
      setCameraOn(hasVideo)
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !startMuted
      })
      setMuted(startMuted)
      setDeafened(startDeafened)

      const ack = await new Promise((resolve) => {
        let settled = false
        const finish = (result) => {
          if (settled) return
          settled = true
          window.clearTimeout(timeoutId)
          resolve(result)
        }
        const timeoutId = window.setTimeout(() => finish({ error: 'timeout' }), VOICE_JOIN_ACK_MS)
        socket.emit('voice:join', { channelId, username: user?.username }, finish)
      })

      if (isStale()) return

      joinInProgressRef.current = false
      if (!ack?.ok) {
        const err = ack?.error
        reportError('voice.join', new Error(String(err || 'join_failed')))
        setError(voiceJoinErrorMessage(tr, err))
        teardownVoiceOutgoingProcessing()
        stream.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
        rawVoiceStreamRef.current = null
        voiceJoinedChannelRef.current = null
        clearLocalMeter()
        return
      }

      voiceJoinedChannelRef.current = channelId
      setJoined(true)
      setJoining(false)
      onVoiceSessionChange?.({ joined: true, channelId })
      setParticipants(ack.participants || [])
      requestAnimationFrame(refreshVoiceMediaElements)
      for (const p of ack.participants || []) {
        if (p.socketId === socket.id) continue
        createPeer(p.socketId, true)
      }
    } catch {
      if (!isStale()) {
        teardownVoiceOutgoingProcessing()
        if (rawVoiceStreamRef.current) {
          rawVoiceStreamRef.current.getTracks().forEach((t) => t.stop())
          rawVoiceStreamRef.current = null
        }
        localStreamRef.current = null
        clearLocalMeter()
        setError(discordStyle ? tr('voiceRoom.errNoMicCamera') : tr('voiceRoom.errNoMic'))
      }
    } finally {
      if (!isStale()) {
        joinInProgressRef.current = false
        if (voiceJoinedChannelRef.current !== channelId) {
          setJoining(false)
        }
      }
    }
  }
  joinVoiceRef.current = joinVoice

  useEffect(() => {
    if (!autoJoin || !channelId) return undefined
    let cancelled = false
    let innerRaf = 0
    const outerRaf = window.requestAnimationFrame(() => {
      innerRaf = window.requestAnimationFrame(() => {
        if (cancelled) return
        void joinVoiceRef.current({ discordStyle: true })
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(outerRaf)
      if (innerRaf) window.cancelAnimationFrame(innerRaf)
    }
  }, [channelId, autoJoin])

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !autoJoin || !channelId) return undefined
    const retryJoin = () => {
      if (joinInProgressRef.current || voiceJoinedChannelRef.current === channelId) return
      void joinVoiceRef.current({ discordStyle: true })
    }
    socket.on('connect', retryJoin)
    return () => {
      socket.off('connect', retryJoin)
    }
  }, [channelId, autoJoin])

  function leaveVoice() {
    const hadServerSession = voiceJoinedChannelRef.current != null
    joinGenerationRef.current += 1
    joinInProgressRef.current = false
    setJoining(false)
    cleanupScreenShareOnLeave()
    voiceJoinedChannelRef.current = null
    const socket = getSocket()
    if (socket && channelId && hadServerSession) {
      socket.emit('voice:leave', { channelId })
    }
    peersRef.current.forEach((pc) => pc.close())
    peersRef.current.clear()
    remoteAnalysersRef.current.clear()
    teardownVoiceOutgoingProcessing()
    clearLocalMeter()
    if (pendingAudioCtxCloseRef.current) {
      clearTimeout(pendingAudioCtxCloseRef.current)
      pendingAudioCtxCloseRef.current = null
    }
    const ctxToClose = audioContextRef.current
    dispatchVoiceSession({ type: 'leave-reset' })
    if (rawVoiceStreamRef.current) {
      rawVoiceStreamRef.current.getTracks().forEach((t) => t.stop())
      rawVoiceStreamRef.current = null
    } else if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    localStreamRef.current = null
    stopMicTest()
    lastScreenShareIdsKeyRef.current = ''
    if (hadServerSession) {
      onVoiceSessionChange?.({ joined: false, channelId })
    }
    requestAnimationFrame(refreshVoiceMediaElements)
    pendingAudioCtxCloseRef.current = window.setTimeout(() => {
      pendingAudioCtxCloseRef.current = null
      if (ctxToClose && ctxToClose.state !== 'closed') {
        ctxToClose.close().catch((err) => reportError('voice.closeAudioContext', err))
      }
      if (audioContextRef.current === ctxToClose) {
        audioContextRef.current = null
      }
    }, 0)
  }
  leaveVoiceRef.current = leaveVoice

  useEffect(() => {
    return () => {
      leaveVoiceRef.current()
    }
  }, [channelId])

  function toggleMute() {
    if (!localStreamRef.current) return
    const next = !muted
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !next
    })
    setMuted(next)
    if (!next && deafened) {
      setDeafened(false)
    }
  }

  function toggleLocalScreenAudioSend() {
    const next = !localScreenAudioSendMuted
    setLocalScreenAudioSendMuted(next)
    screenShareAudioTracksRef.current.forEach((t) => {
      if (t.readyState === 'live') t.enabled = !next
    })
  }

  function toggleRemoteScreenAudioMute(socketId) {
    setRemoteScreenAudioMuted((prev) => ({
      ...prev,
      [socketId]: !prev[socketId],
    }))
  }

  function toggleDeafened() {
    if (!joined) return
    const next = !deafened
    setDeafened(next)
    if (next) {
      if (!muted) {
        localStreamRef.current?.getAudioTracks().forEach((track) => {
          track.enabled = false
        })
        setMuted(true)
      }
      return
    }
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted
    })
  }

  async function startMicTest() {
    if (joined || testingMic) return
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: getMicTestAudioConstraints(),
        video: false,
      })
      micTestStreamRef.current = stream
      setTestingMic(true)
      setupLocalAnalyser(stream)
    } catch {
      setError(tr('voiceRoom.errMicTest'))
    }
  }

  function stopMicTest() {
    if (micTestStreamRef.current) {
      micTestStreamRef.current.getTracks().forEach((t) => t.stop())
      micTestStreamRef.current = null
    }
    setTestingMic(false)
    if (!joined) {
      clearLocalMeter()
    }
  }

  function updateParticipantVolume(socketId, value) {
    const normalized = Math.max(0, Math.min(100, Number(value) || 0))
    setRemoteVolumes((prev) => ({ ...prev, [socketId]: normalized }))
    const mediaEl = remoteMediaRef.current.get(socketId)
    if (mediaEl) {
      mediaEl.volume = normalized / 100
    }
  }

  async function toggleCamera() {
    if (!joined || !localStreamRef.current) return
    setError('')
    const stream = localStreamRef.current
    const hasVideo = stream.getVideoTracks().length > 0
    try {
      if (hasVideo) {
        const cameraTracks = stream.getVideoTracks()
        const cameraTrackIds = new Set(cameraTracks.map((t) => t.id))
        cameraTracks.forEach((t) => {
          t.stop()
          stream.removeTrack(t)
        })
        peersRef.current.forEach((pc) => {
          pc.getSenders().forEach((sender) => {
            if (
              sender.track &&
              sender.track.kind === 'video' &&
              cameraTrackIds.has(sender.track.id)
            ) {
              pc.removeTrack(sender)
            }
          })
        })
        setCameraOn(false)
        await renegotiateAllPeers()
      } else {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: getVoiceVideoConstraints(),
          audio: false,
        })
        const vt = vStream.getVideoTracks()[0]
        stream.addTrack(vt)
        peersRef.current.forEach((pc) => {
          pc.addTrack(vt, stream)
        })
        setCameraOn(true)
        await renegotiateAllPeers()
      }
      requestAnimationFrame(refreshVoiceMediaElements)
    } catch {
      setError(tr('voiceRoom.errCameraToggle'))
    }
  }

  /** Sincronizar mic/sordina con el servidor para lista de canal y otros clientes. */
  useEffect(() => {
    if (!joined || !channelId) return undefined
    const socket = getSocket()
    if (!socket) return undefined
    socket.emit('voice:state', { channelId, mic_muted: muted, deafened })
    return undefined
  }, [joined, channelId, muted, deafened])

  /** Actualizar badges cuando voice:presence incluye mic_muted / deafened. */
  const onVoicePresenceBadges = useEffectEvent(({ channelId: cid, participants: list }) => {
    if (String(cid) !== String(channelId) || !Array.isArray(list)) return
    setParticipants((prev) => {
      const bySocket = new Map(list.map((p) => [p.socketId, p]))
      return prev.map((p) => {
        const u = bySocket.get(p.socketId)
        if (!u) return p
        return {
          ...p,
          mic_muted: u.mic_muted,
          deafened: u.deafened,
        }
      })
    })
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !channelId || !joined) return undefined
    socket.on('voice:presence', onVoicePresenceBadges)
    return () => {
      socket.off('voice:presence', onVoicePresenceBadges)
    }
  }, [channelId, joined])

  useEffect(() => {
    try {
      localStorage.setItem(volumeStorageKey, JSON.stringify(remoteVolumes))
    } catch {
      /* ignore storage errors */
    }
  }, [remoteVolumes, volumeStorageKey])

  const voiceCap = voiceCapNumber(voiceUserLimit)
  const showVoiceCap = voiceCap != null && typeof voiceConnectedCount === 'number'
  const displayTitle = channelLabel || tr('voiceRoom.defaultChannelName')

  const showScreenFocusPip =
    Boolean(resolvedScreenFocusId) &&
    (resolvedScreenFocusId === 'local'
      ? cameraOn && screenSharing
      : streamHasCameraPip(remoteStreams[resolvedScreenFocusId]))

  const hasScreenShareStage = joined && screenShareOptions.length > 0

  const localHasScreenShareAudio =
    screenSharing &&
    localScreenStream &&
    localScreenStream.getAudioTracks().some((t) => t.readyState === 'live')

  const remoteParticipants = useMemo(() => {
    const myId = getSocket()?.id
    const out = []
    for (const p of participants) {
      if (p.socketId !== myId) out.push(p)
    }
    return out
  }, [participants])
  return {
    tr,
    compact,
    channelLabel,
    voiceUserLimit,
    voiceConnectedCount,
    joined,
    participants,
    muted,
    deafened,
    speakingMap,
    remoteStreams,
    cameraOn,
    screenSharing,
    localScreenStream,
    remoteScreenAudioMuted,
    testingMic,
    joining,
    error,
    micLevel,
    remoteVolumes,
    remoteAvatarFailed,
    setRemoteAvatarFailed,
    screenFocusId,
    setScreenFocusId,
    localScreenAudioSendMuted,
    localScreenPreviewMuted,
    resolvedScreenFocusId,
    screenShareOptions,
    hasScreenShareStage,
    showScreenFocusPip,
    localHasScreenShareAudio,
    remoteParticipants,
    user,
    autoJoin,
    displayTitle,
    showVoiceCap,
    voiceCap,
    localVideoRef,
    localScreenVideoRef,
    localPipVideoRef,
    screenFocusVideoRef,
    screenFocusShellRef,
    screenFocusPipVideoRef,
    localScreenShareAudioPreviewRef,
    remoteMediaRef,
    ensureAudioContext,
    applyScreenFocusVideo,
    applyScreenFocusPipVideo,
    applyLocalVideoElements,
    applyLocalScreenAudioPreview,
    updateParticipantVolume,
    toggleRemoteScreenAudioMute,
    toggleLocalScreenAudioSend,
    setLocalScreenPreviewMuted,
    startMicTest,
    stopMicTest,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafened,
    toggleCamera,
    toggleScreenShare,
  }
}
