export const MONITOR_WINDOW_REGISTRY = [
  {
    id: 'monitor.overview',
    title: 'Overview',
    defaultRect: { x: 48, y: 56, width: 360, height: 320 },
    defaultVisible: true,
    snapTo: ['monitor.system', 'monitor.services'],
  },
  {
    id: 'monitor.system',
    title: 'Cliente',
    defaultRect: { x: 420, y: 56, width: 400, height: 320 },
    defaultVisible: true,
    snapTo: ['monitor.overview', 'monitor.services'],
  },
  {
    id: 'monitor.services',
    title: 'Servicios',
    defaultRect: { x: 48, y: 388, width: 772, height: 200 },
    defaultVisible: true,
    snapTo: ['monitor.overview'],
  },
]

export function monitorDefaultLayout() {
  return MONITOR_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
