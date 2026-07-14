export const DASHBOARD_WINDOW_REGISTRY = [
  {
    id: 'dashboard.widgets',
    title: 'Widgets',
    defaultRect: { x: 48, y: 56, width: 360, height: 320 },
    defaultVisible: true,
    snapTo: ['dashboard.activity', 'dashboard.quick'],
  },
  {
    id: 'dashboard.activity',
    title: 'Actividad',
    defaultRect: { x: 420, y: 56, width: 400, height: 320 },
    defaultVisible: true,
    snapTo: ['dashboard.widgets', 'dashboard.quick'],
  },
  {
    id: 'dashboard.quick',
    title: 'Accesos',
    defaultRect: { x: 48, y: 388, width: 772, height: 160 },
    defaultVisible: true,
    snapTo: ['dashboard.widgets'],
  },
]

export function dashboardDefaultLayout() {
  return DASHBOARD_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
