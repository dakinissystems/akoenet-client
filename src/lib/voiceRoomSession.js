const VOICE_SESSION_IDLE = {
  speakingMap: {},
  remoteStreams: {},
  remoteScreenAudioMuted: {},
  cameraOn: false,
  screenSharing: false,
  localScreenStream: null,
  participants: [],
  joined: false,
  muted: false,
  deafened: false,
}

function voiceSessionReducer(state, action) {
  switch (action.type) {
    case 'leave-reset':
      return { ...VOICE_SESSION_IDLE }
    case 'patch': {
      const patch = typeof action.patch === 'function' ? action.patch(state) : action.patch
      return { ...state, ...patch }
    }
    default:
      return state
  }
}

export { VOICE_SESSION_IDLE, voiceSessionReducer }
