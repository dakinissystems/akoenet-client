import { getSocket } from '../services/socket'

export function emitToggleReaction(messageId, reactionKey, active) {
  const s = getSocket()
  if (!s) return
  s.emit('react_message', { message_id: messageId, reaction_key: reactionKey, active })
}
