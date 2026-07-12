import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildCommandItems } from './addonCatalog.js'

const NAV_COMMANDS = [
  { id: 'nav-home', labelKey: 'workspace.cmdHome', route: '/' },
  { id: 'nav-messages', labelKey: 'workspace.cmdMessages', route: '/messages' },
  { id: 'nav-media', labelKey: 'workspace.cmdMedia', route: '/media' },
  { id: 'nav-workspace', labelKey: 'workspace.cmdWorkspace', route: '/workspace' },
]

function matchQuery(q, text, keywords = []) {
  const needle = String(q || '').trim().toLowerCase()
  if (!needle) return true
  const hay = [text, ...keywords].join(' ').toLowerCase()
  return hay.includes(needle)
}

export default function CommandPalette({ open, onClose, t, locale = 'es' }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const [query, setQuery] = useState('')

  const addonItems = useMemo(() => buildCommandItems(locale), [locale])

  const items = useMemo(() => {
    const nav = NAV_COMMANDS.map((c) => ({
      ...c,
      label: t(c.labelKey),
      group: 'nav',
    }))
    const addons = addonItems.map((a) => ({
      ...a,
      label: a.label,
      group: 'addons',
    }))
    return [...nav, ...addons].filter((item) => matchQuery(query, item.label, item.keywords))
  }, [addonItems, query, t])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function onCancel(e) {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

  function run(item) {
    onClose()
    if (item.route) navigate(item.route)
  }

  return (
    <dialog ref={dialogRef} className="ws-cmdk" aria-label={t('workspace.cmdTitle')}>
      <div className="ws-cmdk-inner">
        <input
          ref={inputRef}
          className="ws-cmdk-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('workspace.cmdPlaceholder')}
          aria-label={t('workspace.cmdPlaceholder')}
        />
        <ul className="ws-cmdk-list" role="listbox">
          {items.length === 0 ? (
            <li className="ws-cmdk-empty muted">{t('workspace.cmdEmpty')}</li>
          ) : (
            items.slice(0, 24).map((item) => (
              <li key={item.id}>
                <button type="button" className="ws-cmdk-item" onClick={() => run(item)}>
                  <span>{item.label}</span>
                  {item.phase === 'future' ? (
                    <span className="ws-cmdk-badge">{t('workspace.phaseFuture')}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="ws-cmdk-hint muted small">{t('workspace.cmdHint')}</p>
      </div>
    </dialog>
  )
}

export function useCommandPaletteShortcut(onOpen) {
  useEffect(() => {
    function onKeyDown(e) {
      const isK = e.key?.toLowerCase() === 'k'
      if (!isK || !(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      onOpen()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpen])
}
