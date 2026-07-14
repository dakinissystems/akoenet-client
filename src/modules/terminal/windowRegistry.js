export const TERMINAL_WINDOW_REGISTRY = [
  {
    id: 'terminal.shell',
    title: 'Shell',
    defaultRect: { x: 48, y: 56, width: 520, height: 280 },
    defaultVisible: true,
    snapTo: ['terminal.logs', 'terminal.bookmarks'],
  },
  {
    id: 'terminal.logs',
    title: 'Salida',
    defaultRect: { x: 48, y: 348, width: 520, height: 220 },
    defaultVisible: true,
    snapTo: ['terminal.shell'],
  },
  {
    id: 'terminal.bookmarks',
    title: 'Bookmarks',
    defaultRect: { x: 580, y: 56, width: 240, height: 512 },
    defaultVisible: true,
    snapTo: ['terminal.shell'],
  },
]

export function terminalDefaultLayout() {
  return TERMINAL_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
