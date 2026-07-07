import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const voicePath = path.join(root, 'components/VoiceRoom.jsx')
const lines = fs.readFileSync(voicePath, 'utf8').split(/\r?\n/)

const utilsBlock = lines.slice(16, 138).join('\n')
const mediaBlock = lines.slice(139, 363).join('\n')
const iconsBlock = lines.slice(372, 566).join('\n')
const sessionBlock = lines.slice(568, 592).join('\n')
const hookBlock = lines.slice(594, 1821).join('\n')
const jsxBlock = lines.slice(1822, 2343).join('\n')

fs.writeFileSync(
  path.join(root, 'lib/voiceRoomUtils.js'),
  `import { reportError } from './reportError'

${utilsBlock}

export function voiceCapNumber(raw) {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return null
  return Math.min(99, Math.floor(n))
}

export function getVoiceParticipantInitial(name) {
  return (name || '?').slice(0, 1).toUpperCase()
}
`
)

fs.writeFileSync(
  path.join(root, 'components/VoiceRemoteParticipantMedia.jsx'),
  `import { useEffect, useState } from 'react'
import { buildRemoteVoicePlaybackGraph, partitionVoiceAndScreenAudio } from '../lib/voiceConstraints'
import { reportError } from '../lib/reportError'
import {
  computeRemoteVideoLayout,
  splitScreenCameraStreams,
} from '../lib/voiceRoomUtils'

${mediaBlock.replace('function RemoteParticipantMedia', 'export default function VoiceRemoteParticipantMedia')}
`
)

fs.writeFileSync(
  path.join(root, 'components/VoiceRoomIcons.jsx',
  `${iconsBlock.replace(/^function /gm, 'export function ').replace('function VoiceToolbarBtn', 'export function VoiceToolbarBtn')}`
)

fs.writeFileSync(
  path.join(root, 'lib/voiceRoomSession.js'),
  `${sessionBlock}

export { VOICE_SESSION_IDLE, voiceSessionReducer }
`
)

fs.writeFileSync(
  path.join(root, 'hooks/useVoiceRoom.js'),
  `import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useEffectEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { getSocket } from '../services/socket'
import {
  buildVoiceOutgoingGraph,
  getVoiceChannelAudioConstraints,
  getVoiceVideoConstraints,
  getMicTestAudioConstraints,
  getScreenShareConstraints,
  partitionVoiceAndScreenAudio,
} from '../lib/voiceConstraints'
import { getSavedVoiceSettings } from '../lib/voiceSettings'
import { reportError } from '../lib/reportError'
import {
  computeLevel,
  getRtcConfig,
  getVoiceParticipantInitial,
  isScreenVideoTrack,
  remoteStreamHasSplittableScreenAudio,
  splitScreenCameraStreams,
  streamHasCameraPip,
  streamHasLiveVideo,
  streamHasScreenShare,
  streamShowsVideoInTile,
  voiceCapNumber,
} from '../lib/voiceRoomUtils'
import { VOICE_SESSION_IDLE, voiceSessionReducer } from '../lib/voiceRoomSession'
import VoiceRemoteParticipantMedia from '../components/VoiceRemoteParticipantMedia'
import {
  IconHeadphones,
  IconHeadphonesDeafened,
  IconMic,
  IconMicMuted,
  IconScreenShare,
  IconVideo,
  IconVideoOff,
  IconVolume,
  IconWaveSpeaking,
  VoiceToolbarBtn,
} from '../components/VoiceRoomIcons'

const rtcConfig = getRtcConfig()

${hookBlock.replace('export default function VoiceRoom({', 'export function useVoiceRoom({').replace(/^  return \(/m, '  const voiceRoomViewProps = (')}
`
)

// Fix hook ending - replace closing of return with return object
const hookContent = fs.readFileSync(path.join(root, 'hooks/useVoiceRoom.js'), 'utf8')
const fixedHook = hookContent.replace(
  /const voiceRoomViewProps = \([\s\S]*$/,
  `${hookBlock.match(/const remoteParticipants = useMemo[\s\S]*/)[0]}

  return {
    tr,
    voiceRoomViewProps: {
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
    },
  }
}
`
)

fs.writeFileSync(path.join(root, 'hooks/useVoiceRoom.js'), fixedHook)

fs.writeFileSync(
  path.join(root, 'components/VoiceRoomView.jsx'),
  `import { getSocket } from '../services/socket'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { getVoiceParticipantInitial, streamHasScreenShare, streamShowsVideoInTile } from '../lib/voiceRoomUtils'
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

export default function VoiceRoomView({ tr, ...p }) {
${jsxBlock.replace(/^  return \(/, '  return (').replace(/^export default function VoiceRoom[\s\S]*?^\) \{/m, '')}
}
`
)

fs.writeFileSync(
  path.join(root, 'components/VoiceRoom.jsx'),
  `import { useVoiceRoom } from '../hooks/useVoiceRoom'
import VoiceRoomView from './VoiceRoomView'

export default function VoiceRoom(props) {
  const { tr, voiceRoomViewProps } = useVoiceRoom(props)
  return <VoiceRoomView tr={tr} {...voiceRoomViewProps} />
}
`
)

console.log('VoiceRoom split complete')
