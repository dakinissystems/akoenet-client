import EmojiText from './EmojiText'
import { emitToggleReaction } from '../lib/chatReactions'

export default function ChatMessageReactions({
  message,
  emojis,
  emojiMap,
  editingMessageId,
  reactionPickerId,
  reactionPickerWrapRef,
  setReactionPickerId,
}) {
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
