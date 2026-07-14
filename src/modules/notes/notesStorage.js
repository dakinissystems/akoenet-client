const STORAGE_KEY = 'akoenet.notes.v1'

/** @type {((store: object) => void) | null} */
let persistHook = null

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { notes: defaultNotes() }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.notes)) return { notes: defaultNotes() }
    return parsed
  } catch {
    return { notes: defaultNotes() }
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

export function bindNotesPersistHook(fn) {
  persistHook = fn
}

export function hydrateNotesStore(data) {
  if (!data || typeof data !== 'object') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function dumpNotesStore() {
  return loadStore()
}

function defaultNotes() {
  const now = new Date().toISOString()
  return [
    {
      id: 'welcome',
      title: 'Bienvenido a Notas',
      body: '# Notas Dakinis\n\nEscribe en **Markdown**. Tus notas se guardan en este dispositivo.\n\n- Lista de la izquierda\n- Editor central\n- Buscar abajo',
      tags: ['welcome'],
      updatedAt: now,
    },
  ]
}

export function listNotes() {
  return [...loadStore().notes].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

/**
 * @param {string} id
 */
export function getNote(id) {
  return loadStore().notes.find((n) => n.id === id) || null
}

/**
 * @param {{ title?: string; body?: string; tags?: string[] }} input
 */
export function createNote(input = {}) {
  const store = loadStore()
  const id = `note_${Date.now().toString(36)}`
  const note = {
    id,
    title: String(input.title || 'Sin título').trim() || 'Sin título',
    body: String(input.body || ''),
    tags: Array.isArray(input.tags) ? input.tags : [],
    updatedAt: new Date().toISOString(),
  }
  store.notes.unshift(note)
  saveStore(store)
  return note
}

/**
 * @param {string} id
 * @param {{ title?: string; body?: string; tags?: string[] }} patch
 */
export function updateNote(id, patch) {
  const store = loadStore()
  const idx = store.notes.findIndex((n) => n.id === id)
  if (idx < 0) return null
  const prev = store.notes[idx]
  const next = {
    ...prev,
    ...(patch.title !== undefined ? { title: String(patch.title).trim() || 'Sin título' } : {}),
    ...(patch.body !== undefined ? { body: String(patch.body) } : {}),
    ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
    updatedAt: new Date().toISOString(),
  }
  store.notes[idx] = next
  saveStore(store)
  return next
}

/**
 * @param {string} id
 */
export function deleteNote(id) {
  const store = loadStore()
  store.notes = store.notes.filter((n) => n.id !== id)
  saveStore(store)
}

/**
 * @param {string} query
 */
export function searchNotes(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return listNotes()
  return listNotes().filter((n) => {
    const hay = [n.title, n.body, ...(n.tags || [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
}
