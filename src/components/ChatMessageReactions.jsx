import EmojiText from './EmojiText'
import { emitToggleReaction } from '../lib/chatReactions'
import api from '../services/api'

export default function ChatMessageReactions({
  message,
  emojis,
  emojiMap,
  editingMessageId,
  reactionPickerId,
  reactionPickerWrapRef,
  setReactionPickerId,
  serverId = null,
  currentUserId = null,
}) {
  const canThank =
    serverId &&
    currentUserId &&
    message?.user_id &&
    Number(message.user_id) !== Number(currentUserId) &&
    !message._optimistic &&
    editingMessageId !== message.id

  const thankAuthor = async () => {
    if (!canThank) return
    try {
      await api.post(`/servers/${serverId}/levels/reputation`, {
        toUserId: Number(message.user_id),
        messageId: Number(message.id),
        reason: 'helpful',
      })
    } catch {
      /* module may be disabled */
    }
  }

  return (
    <div className="reaction-row" ref={reactionPickerId === message.id ? reactionPickerWrapRef : undefined}>
      {!message._optimistic &&
        editingMessageId !== message.id &&
        (message.reactions || []).map((r) => (
          <button
            key={`${message.id}-${r.key}`}
            type="button"
            className={`reaction-chip ${r.reacted ? 'active' : ''}`}
            onClick={() => emitToggleReaction(message.id, r.key, !r.reacted)}
          >
            <EmojiText text={r.key} emojis={emojiMap} /> <span>{r.count}</span>
          </button>
        ))}
      {canThank ? (
        <button
          type="button"
          className="reaction-chip"
          title="Marcar como útil (reputación)"
          onClick={thankAuthor}
        >
          ✔️
        </button>
      ) : null}
      {!message._optimistic && editingMessageId !== message.id && reactionPickerId === message.id && (
        <div className="reaction-picker-inline">
          {['👍', '❤️', '🔥', '😂'].map((k) => (
            <button
              key={k}
              type="button"
              className="reaction-chip"
              onClick={() => emitToggleReaction(message.id, k, true)}
            >
              {k}
            </button>
          ))}
          {emojis.slice(0, 8).map((emoji) => {
            const key = `:${emoji.name}:`
            return (
              <button
                key={`${message.id}-pick-${emoji.id}`}
                type="button"
                className="reaction-chip"
                onClick={() => emitToggleReaction(message.id, key, true)}
              >
                <EmojiText text={key} emojis={emojiMap} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
