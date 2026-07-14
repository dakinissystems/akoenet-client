const STORAGE_KEY = 'akoenet.kanban.v1'

/** @type {((store: object) => void) | null} */
let persistHook = null

export const KANBAN_COLUMNS = [
  { id: 'todo', labelKey: 'kanban.colTodo' },
  { id: 'doing', labelKey: 'kanban.colDoing' },
  { id: 'review', labelKey: 'kanban.colReview' },
  { id: 'done', labelKey: 'kanban.colDone' },
]

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { boards: defaultBoards() }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.boards)) return { boards: defaultBoards() }
    return parsed
  } catch {
    return { boards: defaultBoards() }
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

export function bindKanbanPersistHook(fn) {
  persistHook = fn
}

export function hydrateKanbanStore(data) {
  if (!data || typeof data !== 'object') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function dumpKanbanStore() {
  return loadStore()
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function defaultBoards() {
  const now = new Date().toISOString()
  return [
    {
      id: 'board_default',
      title: 'Mi tablero',
      updatedAt: now,
      tasks: [
        {
          id: 'task_welcome_todo',
          title: 'Ejemplo · backlog',
          description: 'Arrastra o mueve tareas entre columnas.',
          column: 'todo',
          updatedAt: now,
        },
        {
          id: 'task_welcome_doing',
          title: 'Ejemplo · en curso',
          description: 'Integrado con Workspace OS y snap de ventanas.',
          column: 'doing',
          updatedAt: now,
        },
      ],
    },
  ]
}

export function listBoards() {
  return [...loadStore().boards].sort((a, b) =>
    String(b.updatedAt).localeCompare(String(a.updatedAt))
  )
}

export function getBoard(id) {
  return loadStore().boards.find((b) => b.id === id) || null
}

export function createBoard(title = 'Nuevo tablero') {
  const store = loadStore()
  const board = {
    id: newId('board'),
    title: String(title).trim() || 'Nuevo tablero',
    updatedAt: new Date().toISOString(),
    tasks: [],
  }
  store.boards.unshift(board)
  saveStore(store)
  return board
}

export function updateBoard(id, patch) {
  const store = loadStore()
  const idx = store.boards.findIndex((b) => b.id === id)
  if (idx < 0) return null
  const prev = store.boards[idx]
  const next = {
    ...prev,
    ...(patch.title !== undefined ? { title: String(patch.title).trim() || prev.title } : {}),
    ...(patch.tasks !== undefined ? { tasks: patch.tasks } : {}),
    updatedAt: new Date().toISOString(),
  }
  store.boards[idx] = next
  saveStore(store)
  return next
}

export function deleteBoard(id) {
  const store = loadStore()
  store.boards = store.boards.filter((b) => b.id !== id)
  saveStore(store)
}

export function createTask(boardId, partial = {}) {
  const store = loadStore()
  const idx = store.boards.findIndex((b) => b.id === boardId)
  if (idx < 0) return null
  const task = {
    id: newId('task'),
    title: String(partial.title || 'Nueva tarea').trim() || 'Nueva tarea',
    description: String(partial.description || ''),
    column: partial.column || 'todo',
    updatedAt: new Date().toISOString(),
  }
  store.boards[idx].tasks.unshift(task)
  store.boards[idx].updatedAt = new Date().toISOString()
  saveStore(store)
  return task
}

export function updateTask(boardId, taskId, patch) {
  const store = loadStore()
  const boardIdx = store.boards.findIndex((b) => b.id === boardId)
  if (boardIdx < 0) return null
  const board = store.boards[boardIdx]
  const taskIdx = board.tasks.findIndex((t) => t.id === taskId)
  if (taskIdx < 0) return null
  const prev = board.tasks[taskIdx]
  const next = {
    ...prev,
    ...(patch.title !== undefined ? { title: String(patch.title).trim() || prev.title } : {}),
    ...(patch.description !== undefined ? { description: String(patch.description) } : {}),
    ...(patch.column !== undefined ? { column: patch.column } : {}),
    updatedAt: new Date().toISOString(),
  }
  board.tasks[taskIdx] = next
  board.updatedAt = new Date().toISOString()
  saveStore(store)
  return next
}

export function deleteTask(boardId, taskId) {
  const store = loadStore()
  const boardIdx = store.boards.findIndex((b) => b.id === boardId)
  if (boardIdx < 0) return
  const board = store.boards[boardIdx]
  board.tasks = board.tasks.filter((t) => t.id !== taskId)
  board.updatedAt = new Date().toISOString()
  saveStore(store)
}

export function searchTasks(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  const results = []
  for (const board of listBoards()) {
    for (const task of board.tasks) {
      const hay = [task.title, task.description, board.title].join(' ').toLowerCase()
      if (hay.includes(q)) {
        results.push({ board, task })
      }
    }
  }
  return results
}

export function tasksByColumn(board, columnId) {
  if (!board) return []
  return board.tasks.filter((t) => t.column === columnId)
}
