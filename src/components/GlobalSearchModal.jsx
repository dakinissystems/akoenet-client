import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

const SEARCH_INITIAL = { open: false, q: '', busy: false, results: [], error: '' }

function searchReducer(state, action) {
  switch (action.type) {
    case 'open':
      return { ...state, open: true }
    case 'close':
      return { ...SEARCH_INITIAL }
    case 'set-q':
      return { ...state, q: action.q }
    case 'search-start':
      return { ...state, busy: true, error: '' }
    case 'search-success':
      return { ...state, busy: false, results: action.results }
    case 'search-fail':
      return { ...state, busy: false, results: [], error: action.error }
    default:
      return state
  }
}

export default function GlobalSearchModal() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const [state, dispatch] = useReducer(searchReducer, SEARCH_INITIAL)
  const { open, q, busy, results, error } = state

  const runSearch = useCallback(async () => {
    const term = q.trim()
    if (term.length < 2) {
      dispatch({ type: 'search-success', results: [] })
      return
    }
    dispatch({ type: 'search-start' })
    try {
      const { data } = await api.get('/messages/search/global', { params: { q: term, limit: 25 } })
      dispatch({ type: 'search-success', results: Array.isArray(data) ? data : [] })
    } catch {
      dispatch({ type: 'search-fail', error: t('globalSearch.errFailed') })
    }
  }, [q, t])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  function closeModal() {
    dispatch({ type: 'close' })
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function onCancel(e) {
      e.preventDefault()
      closeModal()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [])

  useEffect(() => {
    function onOpenEvent() {
      dispatch({ type: 'open' })
    }
    function onForceClose() {
      dispatch({ type: 'close' })
    }
    window.addEventListener('akoenet-open-global-search', onOpenEvent)
    window.addEventListener('akoenet-close-global-search', onForceClose)
    return () => {
      window.removeEventListener('akoenet-open-global-search', onOpenEvent)
      window.removeEventListener('akoenet-close-global-search', onForceClose)
    }
  }, [])

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) closeModal()
        else dispatch({ type: 'open' })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function hitRow(m) {
    const sid = m.server_id
    const cid = m.channel_id
    if (sid == null || cid == null) return
    navigate(`/server/${sid}?channel=${cid}`)
    closeModal()
  }

  return (
    <dialog
      ref={dialogRef}
      className="global-search-overlay"
      aria-label={t('globalSearch.ariaDialog')}
      onClose={closeModal}
    >
      <button
        type="button"
        className="global-search-backdrop"
        aria-label={t('common.close')}
        onClick={closeModal}
      />
      <div className="global-search-modal card">
        <div className="global-search-head">
          <h2 className="global-search-title">{t('globalSearch.title')}</h2>
          <button type="button" className="btn ghost small" onClick={closeModal}>
            {t('common.close')}
          </button>
        </div>
        <p className="muted small">{t('globalSearch.lead')}</p>
        <form
          className="global-search-form"
          onSubmit={(e) => {
            e.preventDefault()
            runSearch()
          }}
        >
          <input
            className="composer-input"
            value={q}
            onChange={(e) => dispatch({ type: 'set-q', q: e.target.value })}
            placeholder={t('globalSearch.placeholder')}
            aria-label={t('globalSearch.queryAria')}
          />
          <button type="submit" className="btn primary" disabled={busy || q.trim().length < 2}>
            {busy ? t('globalSearch.busy') : t('common.search')}
          </button>
        </form>
        {error && <div className="error-banner inline">{error}</div>}
        <ul className="global-search-results">
          {results.map((m) => (
            <li key={m.id}>
              <button type="button" className="global-search-hit" onClick={() => hitRow(m)}>
                <span className="global-search-hit-path">
                  {m.server_name} → #{m.channel_name}
                </span>
                <span className="global-search-hit-user">{m.username}</span>
                <span className="global-search-hit-text">
                  {m.content && m.content !== '(imagen)' ? m.content.slice(0, 160) : m.image_url ? t('common.image') : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}
