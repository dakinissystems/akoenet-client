import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const srcPath = path.join(root, 'components/VoiceRoom.jsx')
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/)

const hookBody = lines.slice(604, 1821).join('\n')
const viewBody = lines.slice(1822, 2343).join('\n')

const hookHeader = `import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useEffectEvent } from 'react'
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
`

const hookFooter = `
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
`

fs.writeFileSync(path.join(root, 'hooks/useVoiceRoom.js'), hookHeader + hookBody + hookFooter)

const viewHeader = `import { getSocket } from '../services/socket'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import {
  getVoiceParticipantInitial,
  streamHasScreenShare,
  streamShowsVideoInTile,
} from '../lib/voiceRoomUtils'
import VoiceRemoteParticipantMedia from './VoiceRemoteParticipantMedia'
import {
  IconActivityOverlay,
  IconHeadphones,
  IconHeadphonesDeafened,
  IconInviteOverlay,
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
} from './VoiceRoomIcons'

export default function VoiceRoomView({
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
  error,
  micLevel,
  remoteVolumes,
  remoteAvatarFailed,
  setRemoteAvatarFailed,
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
  setScreenFocusId,
  localScreenAudioSendMuted,
  localScreenPreviewMuted,
}) {
`

const viewContent = viewBody
  .replace(/^  return \(/, '  return (')
  .replace(/^\}\)$/, '})')

fs.writeFileSync(path.join(root, 'components/VoiceRoomView.jsx'), viewHeader + viewContent + '\n}\n')

fs.writeFileSync(
  path.join(root, 'components/VoiceRoom.jsx'),
  `import { useVoiceRoom } from '../hooks/useVoiceRoom'
import VoiceRoomView from './VoiceRoomView'

export default function VoiceRoom(props) {
  const viewProps = useVoiceRoom(props)
  return <VoiceRoomView {...viewProps} />
}
`
)

console.log('generated useVoiceRoom + VoiceRoomView')
