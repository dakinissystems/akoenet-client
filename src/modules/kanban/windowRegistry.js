export const KANBAN_WINDOW_REGISTRY = [
  {
    id: 'kanban.boards',
    title: 'Tableros',
    defaultRect: { x: 48, y: 56, width: 240, height: 420 },
    defaultVisible: true,
    snapTo: ['kanban.board'],
  },
  {
    id: 'kanban.board',
    title: 'Tablero',
    defaultRect: { x: 300, y: 56, width: 560, height: 420 },
    defaultVisible: true,
    snapTo: ['kanban.boards', 'kanban.task'],
  },
  {
    id: 'kanban.task',
    title: 'Tarea',
    defaultRect: { x: 300, y: 488, width: 560, height: 180 },
    defaultVisible: true,
    snapTo: ['kanban.board'],
  },
]

export function kanbanDefaultLayout() {
  return KANBAN_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
