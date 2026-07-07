export default function ChatMessageEditBlock({
  editingDraft,
  dispatchChannelUi,
  saveEdit,
  cancelEdit,
  t,
}) {
  return (
    <div className="message-edit-block">
      <textarea
        className="composer-input message-edit-textarea"
        value={editingDraft}
        aria-label={t('chat.editMessage', { defaultValue: 'Edit message' })}
        onChange={(e) => dispatchChannelUi({ type: 'set-editing-draft', draft: e.target.value })}
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            saveEdit()
          }
          if (e.key === 'Escape') cancelEdit()
        }}
      />
      <div className="message-edit-actions">
        <button type="button" className="btn primary small" onClick={saveEdit}>
          {t('chat.save')}
        </button>
        <button type="button" className="btn ghost small" onClick={cancelEdit}>
          {t('chat.cancel')}
        </button>
      </div>
    </div>
  )
}
