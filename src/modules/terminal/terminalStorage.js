const STORAGE_KEY = 'akoenet.terminal.v1'

const DEFAULT_BOOKMARKS = [
  { id: 'bm_workspace', label: 'workspace', command: 'open workspace' },
  { id: 'bm_status', label: 'status', command: 'status' },
  { id: 'bm_hub', label: 'hub', command: 'dakinis hub' },
]

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { history: [], bookmarks: DEFAULT_BOOKMARKS, output: [] }
    const parsed = JSON.parse(raw)
    return {
      history: Array.isArray(parsed.history) ? parsed.history : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : DEFAULT_BOOKMARKS,
      output: Array.isArray(parsed.output) ? parsed.output : [],
    }
  } catch {
    return { history: [], bookmarks: DEFAULT_BOOKMARKS, output: [] }
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function listHistory() {
  return loadStore().history
}

export function listBookmarks() {
  return loadStore().bookmarks
}

export function listOutput() {
  return loadStore().output
}

export function appendOutput(line, type = 'stdout') {
  const store = loadStore()
  const entry = { at: new Date().toISOString(), line, type }
  store.output = [...store.output, entry].slice(-200)
  saveStore(store)
  return entry
}

export function clearOutput() {
  const store = loadStore()
  store.output = []
  saveStore(store)
}

export function pushHistory(command) {
  const cmd = String(command || '').trim()
  if (!cmd) return
  const store = loadStore()
  store.history = [cmd, ...store.history.filter((h) => h !== cmd)].slice(0, 50)
  saveStore(store)
}

export function addBookmark(label, command) {
  const store = loadStore()
  const id = `bm_${Date.now().toString(36)}`
  store.bookmarks.push({ id, label: String(label).trim(), command: String(command).trim() })
  saveStore(store)
  return id
}

export function removeBookmark(id) {
  const store = loadStore()
  store.bookmarks = store.bookmarks.filter((b) => b.id !== id)
  saveStore(store)
}

const OPEN_ROUTES = {
  workspace: '/workspace',
  notes: '/notes',
  kanban: '/kanban',
  calendar: '/calendar',
  dashboard: '/dashboard',
  monitor: '/monitor',
  devops: '/devops',
  code: '/code',
  media: '/media',
  messages: '/messages',
  home: '/',
}

const HUB_BASE = 'https://dakinissystems.com'

/**
 * Pseudo-shell local — no ejecuta procesos del SO.
 * @param {string} input
 * @param {{ navigate?: (path: string) => void; t?: (k: string) => string }} ctx
 */
export function runTerminalCommand(input, ctx = {}) {
  const raw = String(input || '').trim()
  if (!raw) return { lines: [], navigateTo: null, external: null }

  pushHistory(raw)
  const parts = raw.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  /** @type {string[]} */
  const lines = []

  if (cmd === 'help') {
    lines.push(
      'Comandos: help, clear, echo, history, status, open <addon>, dakinis hub|core|stream',
      'bookmark list | add <label> <cmd> | run <label>',
      'Addons: workspace, notes, kanban, calendar, code, dashboard, media, messages'
    )
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'clear') {
    clearOutput()
    return { lines: [], navigateTo: null, external: null, cleared: true }
  }

  if (cmd === 'echo') {
    lines.push(args.join(' ') || '')
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'history') {
    for (const h of listHistory().slice(0, 15)) lines.push(h)
    if (!lines.length) lines.push('(sin historial)')
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'date') {
    lines.push(new Date().toString())
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'status') {
    lines.push('Workspace OS · Terminal Dakinis (local sandbox)')
    lines.push(`URL: ${typeof window !== 'undefined' ? window.location.pathname : ''}`)
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'open' && args[0]) {
    const target = args[0].toLowerCase()
    const route = OPEN_ROUTES[target]
    if (route) return { lines: [`→ ${route}`], navigateTo: route, external: null }
    lines.push(`Addon desconocido: ${args[0]}`)
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'dakinis' && args[0]) {
    const product = args[0].toLowerCase()
    if (product === 'hub') return { lines: ['→ Hub'], navigateTo: null, external: `${HUB_BASE}/hub` }
    if (product === 'core') return { lines: ['→ Core'], navigateTo: null, external: `${HUB_BASE}/core` }
    if (product === 'stream') {
      return { lines: ['→ StreamAutomator'], navigateTo: null, external: 'https://streamautomator.com/director' }
    }
    lines.push('Uso: dakinis hub|core|stream')
    return { lines, navigateTo: null, external: null }
  }

  if (cmd === 'bookmark') {
    const sub = args[0]?.toLowerCase()
    if (sub === 'list') {
      for (const b of listBookmarks()) lines.push(`${b.label}: ${b.command}`)
      if (!lines.length) lines.push('(sin bookmarks)')
      return { lines, navigateTo: null, external: null }
    }
    if (sub === 'add' && args.length >= 3) {
      const label = args[1]
      const command = args.slice(2).join(' ')
      addBookmark(label, command)
      lines.push(`Bookmark "${label}" guardado`)
      return { lines, navigateTo: null, external: null }
    }
    if (sub === 'run' && args[1]) {
      const label = args.slice(1).join(' ')
      const bm = listBookmarks().find((b) => b.label === label)
      if (!bm) {
        lines.push(`Bookmark no encontrado: ${label}`)
        return { lines, navigateTo: null, external: null }
      }
      return runTerminalCommand(bm.command, ctx)
    }
    lines.push('Uso: bookmark list | add <label> <cmd> | run <label>')
    return { lines, navigateTo: null, external: null }
  }

  lines.push(`Comando no reconocido: ${cmd}. Escribe "help".`)
  return { lines, navigateTo: null, external: null }
}
