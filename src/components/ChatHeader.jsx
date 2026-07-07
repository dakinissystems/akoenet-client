export default function ChatHeader({
  channelName,
  isVoice,
  isForum,
  channelId,
  membersCount,
  searchOpen,
  dispatchChannelUi,
  refreshLatestMessages,
  onOpenChannelSettings,
  onOpenMembersPanel,
  exportHistory,
  t,
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-topic">
        <span className="hash" aria-hidden="true">
          {isVoice ? '🔊' : isForum ? '🗂' : '#'}
        </span>
        <div>
          <span className="chat-title">{channelName || t('chat.channelFallback')}</span>
          <p className="chat-header-hint">
            {isVoice ? t('chat.hintVoice') : t('chat.hintLive')}
          </p>
        </div>
      </div>
      <div className="chat-header-actions">
        <button type="button" className="btn ghost small" onClick={refreshLatestMessages} title={t('chat.refreshTitle')}>
          {t('common.refresh')}
        </button>
        {channelId && (
          <button
            type="button"
            className="btn ghost small"
            onClick={onOpenChannelSettings}
            title={t('chat.channelSettingsTitle')}
          >
            ⚙
          </button>
        )}
        {channelId && typeof onOpenMembersPanel === 'function' && (
          <button
            type="button"
            className="btn ghost small chat-members-trigger"
            onClick={onOpenMembersPanel}
            title={t('chat.membersTitle')}
            aria-label={t('chat.membersOpenAria', { count: membersCount })}
          >
            <span className="chat-members-trigger-text">{t('chat.membersLabel')}</span>
            {membersCount > 0 && (
              <span className="chat-members-badge" aria-hidden="true">
                {membersCount > 99 ? '99+' : membersCount}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          className="btn ghost small"
          onClick={() => dispatchChannelUi({ type: 'set-search-open', open: !searchOpen })}
          title={t('chat.searchTitle')}
          aria-expanded={searchOpen}
        >
          🔎
        </button>
        {!isVoice && (
          <div className="chat-save-row" role="group" aria-label={t('chat.downloadHistoryAria')}>
            <button type="button" className="btn link chat-save-link" onClick={() => exportHistory('csv')}>
              {t('chat.spreadsheet')}
            </button>
            <span className="chat-save-dot" aria-hidden="true">
              ·
            </span>
            <button type="button" className="btn link chat-save-link" onClick={() => exportHistory('json')}>
              {t('chat.jsonBackup')}
            </button>
          </div>
        )}
        <span className="chat-live-pill" title={t('chat.liveTitle')}>
          <span className="chat-live-dot" aria-hidden="true" />
          {t('chat.live')}
        </span>
      </div>
    </header>
  )
}
