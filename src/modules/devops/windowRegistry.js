export const DEVOPS_WINDOW_REGISTRY = [
  {
    id: 'devops.deployments',
    title: 'Deployments',
    defaultRect: { x: 48, y: 56, width: 380, height: 340 },
    defaultVisible: true,
    snapTo: ['devops.logs', 'devops.services'],
  },
  {
    id: 'devops.logs',
    title: 'Logs',
    defaultRect: { x: 440, y: 56, width: 380, height: 340 },
    defaultVisible: true,
    snapTo: ['devops.deployments', 'devops.services'],
  },
  {
    id: 'devops.services',
    title: 'Servicios',
    defaultRect: { x: 48, y: 408, width: 772, height: 200 },
    defaultVisible: true,
    snapTo: ['devops.deployments'],
  },
]

export function devopsDefaultLayout() {
  return DEVOPS_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
