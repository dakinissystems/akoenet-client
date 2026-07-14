import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildCommandItems } from './addonCatalog.js'
import { fetchWorkspaceSearchHits } from './workspaceApi.js'
import { resolveAkoenetSearchHitPath } from './searchHitPaths.js'
import { searchLocalAddonHits } from './clientLocalSearch.js'

const NAV_COMMANDS = [
  { id: 'nav-home', labelKey: 'workspace.cmdHome', route: '/' },
  { id: 'nav-messages', labelKey: 'workspace.cmdMessages', route: '/messages' },
  { id: 'nav-media', labelKey: 'workspace.cmdMedia', route: '/media' },
  { id: 'nav-notes', labelKey: 'workspace.cmdNotes', route: '/notes' },
  { id: 'nav-calendar', labelKey: 'workspace.cmdCalendar', route: '/calendar' },
  { id: 'nav-kanban', labelKey: 'workspace.cmdKanban', route: '/kanban' },
  { id: 'nav-dashboard', labelKey: 'workspace.cmdDashboard', route: '/dashboard' },
  { id: 'nav-terminal', labelKey: 'workspace.cmdTerminal', route: '/terminal' },
  { id: 'nav-monitor', labelKey: 'workspace.cmdMonitor', route: '/monitor' },
  { id: 'nav-devops', labelKey: 'workspace.cmdDevops', route: '/devops' },
  { id: 'nav-code', labelKey: 'workspace.cmdCodeEditor', route: '/code' },
  { id: 'nav-workspace', labelKey: 'workspace.cmdWorkspace', route: '/workspace' },
]

const HUB_BASE = String(import.meta.env.VITE_DAKINIS_CORPORATE_URL || 'https://dakinissystems.com').replace(/\/$/, '')

const ECOSYSTEM_COMMANDS = [
  { id: 'eco-hub', labelKey: 'workspace.cmdHub', href: `${HUB_BASE}/hub`, group: 'ecosystem', keywords: ['dakinis', 'mi día'] },
  { id: 'eco-stream', labelKey: 'workspace.cmdStream', href: 'https://streamautomator.com/director', group: 'ecosystem', keywords: ['twitch', 'directo'] },
  { id: 'eco-core', labelKey: 'workspace.cmdCore', href: `${HUB_BASE}/core`, group: 'ecosystem', keywords: ['erp', 'factura'] },
]

const SEARCH_SCOPES = [
  { id: 'all', labelKey: 'workspace.searchScopeAll' },
  { id: 'messages', labelKey: 'workspace.searchScopeMessages' },
  { id: 'chats', labelKey: 'workspace.searchScopeChats' },
  { id: 'customers', labelKey: 'workspace.searchScopeCustomers' },
  { id: 'invoices', labelKey: 'workspace.searchScopeInvoices' },
  { id: 'events', labelKey: 'workspace.searchScopeEvents' },
  { id: 'documents', labelKey: 'workspace.searchScopeDocuments' },
  { id: 'knowledge', labelKey: 'workspace.searchScopeKnowledge' },
]

const SEARCH_SCOPE_LABELS = {
  all: 'workspace.searchScopeAll',
  messages: 'workspace.searchScopeMessages',
  chats: 'workspace.searchScopeChats',
  clients: 'workspace.searchScopeCustomers',
  customers: 'workspace.searchScopeCustomers',
  invoices: 'workspace.searchScopeInvoices',
  events: 'workspace.searchScopeEvents',
  documents: 'workspace.searchScopeDocuments',
  knowledge: 'workspace.searchScopeKnowledge',
  documentation: 'workspace.searchScopeKnowledge',
  streams: 'workspace.searchScopeStreams',
  global: 'workspace.searchScopeAll',
}

const MIN_SEARCH_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 280

const initialSearchState = { hits: [], loading: false }

function searchReducer(state, action) {
  switch (action.type) {
    case 'idle':
      return initialSearchState
    case 'loading':
      return { ...state, loading: true }
    case 'done':
      return { hits: action.hits, loading: false }
    default:
      return state
  }
}

function matchQuery(q, text, keywords = []) {
  const needle = String(q || '').trim().toLowerCase()
  if (!needle) return true
  const hay = [text, ...keywords].join(' ').toLowerCase()
  return hay.includes(needle)
}

function groupBadge(item, t) {
  if (item.kind === 'search') {
    const key = SEARCH_SCOPE_LABELS[item.hit?.scope] || 'workspace.cmdGroupSearch'
    return t(key)
  }
  if (item.group === 'ecosystem') return t('workspace.cmdGroupEcosystem')
  if (item.group === 'nav') return t('workspace.cmdGroupNav')
  if (item.phase === 'future') return t('workspace.phaseFuture')
  return t('workspace.cmdGroupAddons')
}

export default function CommandPalette({ open, onClose, t, locale = 'es' }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const searchSeq = useRef(0)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const [searchState, dispatchSearch] = useReducer(searchReducer, initialSearchState)

  const addonItems = useMemo(() => buildCommandItems(locale), [locale])

  const commandItems = useMemo(() => {
    const nav = NAV_COMMANDS.map((c) => ({
      ...c,
      label: t(c.labelKey),
      group: 'nav',
    }))
    const ecosystem = ECOSYSTEM_COMMANDS.map((c) => ({
      ...c,
      label: t(c.labelKey),
      group: 'ecosystem',
    }))
    const addons = addonItems.map((a) => ({
      ...a,
      label: a.label,
      group: 'addons',
    }))
    return [...nav, ...ecosystem, ...addons].filter((item) =>
      matchQuery(query, item.label, item.keywords)
    )
  }, [addonItems, query, t])

  const trimmed = String(query || '').trim()
  const canFetchSearch = trimmed.length >= MIN_SEARCH_LENGTH

  useEffect(() => {
    if (!canFetchSearch) {
      dispatchSearch({ type: 'idle' })
      return undefined
    }

    const seq = ++searchSeq.current
    const controller = new AbortController()
    dispatchSearch({ type: 'loading' })

    const timer = setTimeout(() => {
      const localHits = searchLocalAddonHits(trimmed, scope)
      fetchWorkspaceSearchHits(trimmed, scope, { signal: controller.signal })
        .then((remoteHits) => {
          if (seq !== searchSeq.current) return
          const merged = []
          const seen = new Set()
          for (const hit of [...localHits, ...(Array.isArray(remoteHits) ? remoteHits : [])]) {
            const key = `${hit.scope}:${hit.id}`
            if (seen.has(key)) continue
            seen.add(key)
            merged.push(hit)
          }
          dispatchSearch({ type: 'done', hits: merged.slice(0, 24) })
        })
        .catch(() => {
          if (seq !== searchSeq.current) return
          dispatchSearch({ type: 'done', hits: localHits.slice(0, 24) })
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [canFetchSearch, trimmed, scope])

  const listItems = useMemo(() => {
    const searchRows = canFetchSearch
      ? searchState.hits.map((hit) => ({
          kind: 'search',
          id: `search:${hit.scope}:${hit.id}`,
          hit,
          label: hit.title || hit.id,
          snippet: hit.snippet || '',
        }))
      : []
    const commands = commandItems.map((item) => ({
      kind: 'command',
      id: item.id,
      item,
      label: item.label,
      snippet: '',
    }))
    return [...searchRows, ...commands]
  }, [canFetchSearch, searchState.hits, commandItems])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
      setQuery('')
      setScope('all')
      dispatchSearch({ type: 'idle' })
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

  const runCommand = useCallback(
    (item) => {
      onClose()
      if (item.href) {
        window.open(item.href, '_blank', 'noopener,noreferrer')
        return
      }
      if (item.route) navigate(item.route)
    },
    [navigate, onClose]
  )

  const runSearchHit = useCallback(
    (hit) => {
      onClose()
      const dest = resolveAkoenetSearchHitPath(hit)
      if (!dest) return
      if (dest.external && dest.href) {
        window.open(dest.href, '_blank', 'noopener,noreferrer')
        return
      }
      if (dest.route) navigate(dest.route)
    },
    [navigate, onClose]
  )

  function activate(entry) {
    if (!entry) return
    if (entry.kind === 'search') runSearchHit(entry.hit)
    else runCommand(entry.item)
  }

  const showEmpty = listItems.length === 0 && !searchState.loading

  return (
    <dialog ref={dialogRef} className="ws-cmdk" aria-label={t('workspace.cmdTitle')}>
      <div className="ws-cmdk-inner">
        <input
          ref={inputRef}
          className="ws-cmdk-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('workspace.cmdSearchPlaceholder')}
          aria-label={t('workspace.cmdSearchPlaceholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && listItems[0]) activate(listItems[0])
          }}
        />
        <div className="ws-cmdk-scopes" role="tablist">
          {SEARCH_SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={scope === s.id}
              className={`ws-cmdk-scope${scope === s.id ? ' is-active' : ''}`}
              onClick={() => setScope(s.id)}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
        <ul className="ws-cmdk-list" role="listbox">
          {searchState.loading ? (
            <li className="ws-cmdk-empty muted">{t('workspace.searchLoading')}</li>
          ) : showEmpty ? (
            <li className="ws-cmdk-empty muted">{t('workspace.cmdEmpty')}</li>
          ) : (
            listItems.slice(0, 24).map((entry) => (
              <li key={entry.id}>
                <button type="button" className="ws-cmdk-item" onClick={() => activate(entry)}>
                  <span className="ws-cmdk-item-main">
                    <span>{entry.label}</span>
                    {entry.snippet ? (
                      <span className="ws-cmdk-snippet muted small">{entry.snippet}</span>
                    ) : null}
                  </span>
                  <span className="ws-cmdk-badge">{groupBadge(entry, t)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="ws-cmdk-hint muted small">{t('workspace.cmdSearchHint')}</p>
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
