import { useVoiceRoom } from '../hooks/useVoiceRoom'
import { useVoiceSidebarControlsBridge } from '../hooks/useVoiceSidebarControlsBridge'
import VoiceRoomView from './VoiceRoomView'

export default function VoiceRoom(props) {
  const { onRegisterVoiceSidebarControls, ...rest } = props
  const viewProps = useVoiceRoom(rest)
  useVoiceSidebarControlsBridge({
    channelId: rest.channelId,
    joined: viewProps.joined,
    muted: viewProps.muted,
    deafened: viewProps.deafened,
    toggleMute: viewProps.toggleMute,
    toggleDeafened: viewProps.toggleDeafened,
    leaveVoice: viewProps.leaveVoice,
    onRegister: onRegisterVoiceSidebarControls,
  })
  return <VoiceRoomView {...viewProps} />
}
