import { useTranslation } from 'react-i18next'

export default function ChatSearchPanel({
  searchQuery,
  searchResults,
  searchBusy,
  dispatchChannelUi,
  runSearch,
  jumpToMessage,
  t: tProp,
}) {
  const { t: tHook } = useTranslation()
  const t = tProp || tHook

  return (
    <section className="chat-search-panel" aria-label={t('chat.searchInChannelAria')}>
      <form className="chat-search-form" onSubmit={runSearch}>
        <input
          className="composer-input chat-search-input"
          value={searchQuery}
          onChange={(e) => dispatchChannelUi({ type: 'set-search-query', query: e.target.value })}
          placeholder={t('chat.searchPlaceholder')}
          aria-label={t('chat.searchQueryAria')}
        />
        <button type="submit" className="btn secondary small" disabled={searchBusy || searchQuery.trim().length < 2}>
          {searchBusy ? '…' : t('common.search')}
        </button>
        <button
          type="button"
          className="btn ghost small"
          onClick={() => dispatchChannelUi({ type: 'close-search' })}
        >
          {t('chat.close')}
        </button>
      </form>
      {searchResults.length > 0 && (
        <ul className="chat-search-results">
          {searchResults.map((sm) => (
            <li key={sm.id}>
              <button
                type="button"
                className="chat-search-hit"
                onClick={() => {
                  jumpToMessage(sm.id)
                  dispatchChannelUi({ type: 'close-search' })
                }}
              >
                <span className="chat-search-hit-user">{sm.username}</span>
                <span className="chat-search-hit-text">
                  {sm.content && sm.content !== '(imagen)'
                    ? sm.content.slice(0, 120)
                    : sm.image_url
                      ? t('common.image')
                      : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
