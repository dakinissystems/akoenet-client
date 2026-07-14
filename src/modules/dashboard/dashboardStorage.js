import { listEvents } from '../calendar/calendarStorage.js'
import { listBoards } from '../kanban/kanbanStorage.js'
import { listNotes } from '../notes/notesStorage.js'

const STORAGE_KEY = 'akoenet.dashboard.widgets.v1'

const DEFAULT_WIDGETS = [
  { id: 'activity', enabled: true },
  { id: 'infra', enabled: true },
  { id: 'notes', enabled: true },
  { id: 'kanban', enabled: true },
  { id: 'calendar', enabled: true },
  { id: 'streams', enabled: true },
  { id: 'hub', enabled: true },
]

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { widgets: DEFAULT_WIDGETS }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.widgets)) return { widgets: DEFAULT_WIDGETS }
    return parsed
  } catch {
    return { widgets: DEFAULT_WIDGETS }
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function listWidgets() {
  return loadStore().widgets
}

export function toggleWidget(id, enabled) {
  const store = loadStore()
  store.widgets = store.widgets.map((w) => (w.id === id ? { ...w, enabled } : w))
  saveStore(store)
  return store.widgets
}

export function collectLocalStats() {
  const notes = listNotes()
  const boards = listBoards()
  const tasks = boards.reduce((sum, b) => sum + (b.tasks?.length || 0), 0)
  const events = listEvents()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const eventsToday = events.filter((e) => {
    const d = new Date(e.startAt)
    return d >= today && d < tomorrow
  }).length

  return {
    notes: notes.length,
    boards: boards.length,
    tasks,
    eventsToday,
    eventsTotal: events.length,
  }
}

export const WIDGET_DEFS = [
  { id: 'activity', route: null, labelKey: 'dashboard.widgetActivity' },
  { id: 'infra', route: '/monitor', labelKey: 'dashboard.widgetInfra' },
  { id: 'notes', route: '/notes', labelKey: 'dashboard.widgetNotes' },
  { id: 'kanban', route: '/kanban', labelKey: 'dashboard.widgetKanban' },
  { id: 'calendar', route: '/calendar', labelKey: 'dashboard.widgetCalendar' },
  { id: 'streams', route: 'https://streamautomator.com/director', labelKey: 'dashboard.widgetStreams', external: true },
  { id: 'hub', route: '/workspace', labelKey: 'dashboard.widgetHub' },
]
