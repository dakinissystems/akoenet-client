const STORAGE_KEY = 'akoenet.calendar.v1'

/** @type {((store: object) => void) | null} */
let persistHook = null

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { events: defaultEvents() }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.events)) return { events: defaultEvents() }
    return parsed
  } catch {
    return { events: defaultEvents() }
  }
}

function saveStore(store) {
  try {
    const next = { ...store, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    persistHook?.(next)
  } catch {
    /* ignore */
  }
}

export function bindCalendarPersistHook(fn) {
  persistHook = fn
}

export function hydrateCalendarStore(data) {
  if (!data || typeof data !== 'object') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function dumpCalendarStore() {
  return loadStore()
}

export function searchEvents(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  return listEvents().filter((evt) => {
    const hay = [evt.title, evt.description, evt.startAt].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

function defaultEvents() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const end = new Date(tomorrow)
  end.setHours(11, 0, 0, 0)
  return [
    {
      id: 'evt-demo',
      title: 'Reunión de equipo',
      startAt: tomorrow.toISOString(),
      endAt: end.toISOString(),
      allDay: false,
      description: '',
    },
  ]
}

function newId() {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function listEvents() {
  return [...loadStore().events].sort((a, b) =>
    String(a.startAt).localeCompare(String(b.startAt))
  )
}

export function getEvent(id) {
  return loadStore().events.find((e) => e.id === id) || null
}

export function createEvent(partial = {}) {
  const now = new Date()
  const start = partial.startAt ? new Date(partial.startAt) : now
  const end = partial.endAt
    ? new Date(partial.endAt)
    : new Date(start.getTime() + 60 * 60 * 1000)
  const event = {
    id: newId(),
    title: partial.title || 'Evento',
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    allDay: Boolean(partial.allDay),
    description: partial.description || '',
  }
  const store = loadStore()
  store.events.push(event)
  saveStore(store)
  return event
}

export function updateEvent(id, patch) {
  const store = loadStore()
  const idx = store.events.findIndex((e) => e.id === id)
  if (idx < 0) return null
  const prev = store.events[idx]
  const next = {
    ...prev,
    ...patch,
    id: prev.id,
    startAt: patch.startAt ? new Date(patch.startAt).toISOString() : prev.startAt,
    endAt: patch.endAt ? new Date(patch.endAt).toISOString() : prev.endAt,
  }
  store.events[idx] = next
  saveStore(store)
  return next
}

export function deleteEvent(id) {
  const store = loadStore()
  store.events = store.events.filter((e) => e.id !== id)
  saveStore(store)
}

export function eventsForDay(date) {
  const day = startOfDay(date)
  const next = new Date(day)
  next.setDate(next.getDate() + 1)
  return listEvents().filter((evt) => {
    const start = new Date(evt.startAt)
    if (evt.allDay) {
      const evtDay = startOfDay(start)
      return evtDay.getTime() === day.getTime()
    }
    return start >= day && start < next
  })
}

export function eventsInRange(startDate, endDate) {
  const start = startOfDay(startDate).getTime()
  const end = startOfDay(endDate).getTime() + 24 * 60 * 60 * 1000
  return listEvents().filter((evt) => {
    const t = new Date(evt.startAt).getTime()
    return t >= start && t < end
  })
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function startOfWeek(date) {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function weekDays(anchorDate) {
  const start = startOfWeek(anchorDate)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function toDateInputValue(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
