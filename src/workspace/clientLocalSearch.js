import { searchNotes } from '../modules/notes/notesStorage.js'
import { searchTasks } from '../modules/kanban/kanbanStorage.js'
import { searchEvents } from '../modules/calendar/calendarStorage.js'
import { searchFiles } from '../modules/code-editor/codeEditorStorage.js'

/**
 * Búsqueda local en addons AkoeNet (localStorage).
 * @param {string} query
 * @param {string} [scope='all']
 */
export function searchLocalAddonHits(query, scope = 'all') {
  const q = String(query || '').trim()
  if (q.length < 2) return []

  /** @type {object[]} */
  const hits = []

  if (scope === 'all' || scope === 'documents' || scope === 'knowledge') {
    for (const note of searchNotes(q).slice(0, 6)) {
      hits.push({
        scope: 'documents',
        id: `local:note:${note.id}`,
        title: note.title,
        snippet: String(note.body || '').slice(0, 100),
        path: '/notes',
        product: 'akoenet',
        score: 0.95,
      })
    }
    for (const file of searchFiles(q).slice(0, 6)) {
      hits.push({
        scope: 'documents',
        id: `local:code:${file.id}`,
        title: file.name,
        snippet: String(file.content || '').slice(0, 80),
        path: '/code',
        product: 'akoenet',
        score: 0.91,
      })
    }
  }

  if (scope === 'all' || scope === 'events') {
    for (const { board, task } of searchTasks(q).slice(0, 6)) {
      hits.push({
        scope: 'events',
        id: `local:task:${task.id}`,
        title: task.title,
        snippet: `${board.title} · ${task.column}`,
        path: '/kanban',
        product: 'akoenet',
        score: 0.93,
      })
    }
    for (const evt of searchEvents(q).slice(0, 6)) {
      hits.push({
        scope: 'events',
        id: `local:evt:${evt.id}`,
        title: evt.title,
        snippet: String(evt.startAt || '').slice(0, 40),
        path: '/calendar',
        product: 'akoenet',
        score: 0.92,
      })
    }
  }

  return hits
}
