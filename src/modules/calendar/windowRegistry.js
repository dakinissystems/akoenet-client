export const CALENDAR_WINDOW_REGISTRY = [
  {
    id: 'calendar.agenda',
    title: 'Agenda',
    defaultRect: { x: 48, y: 56, width: 300, height: 440 },
    defaultVisible: true,
    snapTo: ['calendar.week', 'calendar.detail'],
  },
  {
    id: 'calendar.week',
    title: 'Semana',
    defaultRect: { x: 360, y: 56, width: 520, height: 300 },
    defaultVisible: true,
    snapTo: ['calendar.agenda', 'calendar.detail'],
  },
  {
    id: 'calendar.detail',
    title: 'Detalle',
    defaultRect: { x: 360, y: 368, width: 520, height: 220 },
    defaultVisible: true,
    snapTo: ['calendar.week'],
  },
]

export function calendarDefaultLayout() {
  return CALENDAR_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
