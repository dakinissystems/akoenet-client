import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const lines = fs.readFileSync(path.join(root, 'components/VoiceRoom.jsx'), 'utf8').split(/\r?\n/)

const utilsHeader = `import { reportError } from './reportError'

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

`

const utilsBody = lines
  .slice(34, 138)
  .join('\n')
  .replace(/^function /gm, 'export function ')

fs.writeFileSync(
  path.join(root, 'lib/voiceRoomUtils.js'),
  `${utilsHeader}${utilsBody}

export function voiceCapNumber(raw) {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return null
  return Math.min(99, Math.floor(n))
}
`
)

const mediaHeader = `import { useEffect, useState } from 'react'
import { buildRemoteVoicePlaybackGraph, partitionVoiceAndScreenAudio } from '../lib/voiceConstraints'
import { reportError } from '../lib/reportError'
import { computeRemoteVideoLayout, splitScreenCameraStreams } from '../lib/voiceRoomUtils'

`

const mediaBody = lines
  .slice(139, 363)
  .join('\n')
  .replace('function RemoteParticipantMedia', 'export default function VoiceRemoteParticipantMedia')

fs.writeFileSync(path.join(root, 'components/VoiceRemoteParticipantMedia.jsx'), mediaHeader + mediaBody)

const iconsBody = lines.slice(372, 566).join('\n').replace(/^function /gm, 'export function ')
fs.writeFileSync(path.join(root, 'components/VoiceRoomIcons.jsx'), iconsBody)

const sessionBody = `${lines.slice(568, 592).join('\n')}

export { VOICE_SESSION_IDLE, voiceSessionReducer }
`
fs.writeFileSync(path.join(root, 'lib/voiceRoomSession.js'), sessionBody)

console.log('voice room support files ready')
