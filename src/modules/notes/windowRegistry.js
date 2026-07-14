export const NOTES_WINDOW_REGISTRY = [
  {
    id: 'notes.list',
    title: 'Notas',
    defaultRect: { x: 48, y: 56, width: 260, height: 420 },
    defaultVisible: true,
    snapTo: ['notes.editor'],
  },
  {
    id: 'notes.editor',
    title: 'Editor',
    defaultRect: { x: 320, y: 56, width: 520, height: 420 },
    defaultVisible: true,
    snapTo: ['notes.list', 'notes.search'],
  },
  {
    id: 'notes.search',
    title: 'Buscar',
    defaultRect: { x: 320, y: 488, width: 520, height: 140 },
    defaultVisible: true,
    snapTo: ['notes.editor'],
  },
]

export function notesDefaultLayout() {
  return NOTES_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
