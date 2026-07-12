export const WINDOW_REGISTRY = [
  {
    id: "player.main",
    title: "Player",
    defaultRect: { x: 48, y: 56, width: 340, height: 200 },
    defaultVisible: true,
    snapTo: ["player.playlist", "player.eq"],
  },
  {
    id: "player.playlist",
    title: "Playlist",
    defaultRect: { x: 48, y: 268, width: 340, height: 240 },
    defaultVisible: true,
    snapTo: ["player.main"],
  },
  {
    id: "player.eq",
    title: "Equalizer",
    defaultRect: { x: 400, y: 56, width: 300, height: 200 },
    defaultVisible: true,
    snapTo: ["player.main"],
  },
  {
    id: "player.visualizer",
    title: "Visualizer",
    defaultRect: { x: 712, y: 56, width: 300, height: 200 },
    defaultVisible: true,
  },
  {
    id: "player.library",
    title: "Library",
    defaultRect: { x: 400, y: 268, width: 300, height: 240 },
    defaultVisible: true,
  },
  {
    id: "player.friends",
    title: "Friends",
    defaultRect: { x: 712, y: 268, width: 300, height: 180 },
    defaultVisible: true,
  },
];

export function classicLayout() {
  return WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }));
}
