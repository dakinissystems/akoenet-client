import { useVoiceRoom } from '../hooks/useVoiceRoom'
import VoiceRoomView from './VoiceRoomView'

export default function VoiceRoom(props) {
  const viewProps = useVoiceRoom(props)
  return <VoiceRoomView {...viewProps} />
}
