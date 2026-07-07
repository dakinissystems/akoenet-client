export default function ServerSettingsTagPanel({
  serverTag,
  canManageServer,
  tagDraft,
  setTagDraft,
  tagBusy,
  saveServerTag,
  t,
}) {
  return (
    <div className="server-settings-tab-pane">
      <h2 className="server-settings-panel-title">{t('serverModal.tagTitle')}</h2>
      <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
        {t('serverModal.tagLead')}
      </p>
      {canManageServer ? (
        <form onSubmit={saveServerTag} className="form-stack" style={{ maxWidth: 420 }}>
          <div>
            <label htmlFor="server-tag-input">{t('serverModal.tagLabel')}</label>
            <input
              id="server-tag-input"
              name="server_tag"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value.toUpperCase())}
              maxLength={4}
              minLength={0}
              placeholder={t('serverModal.tagPlaceholder')}
              autoComplete="off"
              inputMode="text"
            />
          </div>
          <div className="form-inline" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn primary" disabled={tagBusy}>
              {tagBusy ? t('serverModal.tagSaving') : t('serverModal.tagSave')}
            </button>
            <button type="button" className="btn ghost" disabled={tagBusy} onClick={() => setTagDraft('')}>
              {t('serverModal.tagClear')}
            </button>
          </div>
        </form>
      ) : (
        <p className="muted small">
          {serverTag && String(serverTag).trim() ? (
            <strong className="server-tag-display">{String(serverTag).trim().toUpperCase()}</strong>
          ) : (
            t('serverModal.tagNone')
          )}
        </p>
      )}
      {!canManageServer ? (
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {t('serverModal.tagReadOnly')}
        </p>
      ) : null}
    </div>
  )
}
