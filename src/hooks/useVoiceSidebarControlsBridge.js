import { useEffect } from 'react'

const EMPTY_CONTROLS = {
  channelId: null,
  joined: false,
  muted: false,
  deafened: false,
  toggleMute: () => {},
  toggleDeafened: () => {},
  leaveVoice: () => {},
}

export function useVoiceSidebarControlsBridge({
  channelId,
  joined,
  muted,
  deafened,
  toggleMute,
  toggleDeafened,
  leaveVoice,
  onRegister,
}) {
  useEffect(() => {
    if (!onRegister) return undefined
    if (!joined || channelId == null) {
      onRegister(EMPTY_CONTROLS)
      return () => onRegister(EMPTY_CONTROLS)
    }
    onRegister({
      channelId: Number(channelId),
      joined: true,
      muted: Boolean(muted),
      deafened: Boolean(deafened),
      toggleMute,
      toggleDeafened,
      leaveVoice,
    })
    return () => onRegister(EMPTY_CONTROLS)
  }, [channelId, joined, muted, deafened, toggleMute, toggleDeafened, leaveVoice, onRegister])
}
