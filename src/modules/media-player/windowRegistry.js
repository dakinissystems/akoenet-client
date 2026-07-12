export const WINDOW_REGISTRY = [
  {
    id: "player.main",
    title: "Player",
    defaultRect: { x: 80, y: 80, width: 320, height: 140 },
    defaultVisible: true,
    snapTo: ["player.playlist", "player.eq"],
  },
  {
    id: "player.playlist",
    title: "Playlist",
    defaultRect: { x: 80, y: 230, width: 320, height: 260 },
    defaultVisible: true,
    snapTo: ["player.main"],
  },
  {
    id: "player.eq",
    title: "Equalizer",
    defaultRect: { x: 410, y: 80, width: 320, height: 180 },
    defaultVisible: true,
    snapTo: ["player.main"],
  },
  {
    id: "player.library",
    title: "Library",
    defaultRect: { x: 410, y: 270, width: 320, height: 280 },
    defaultVisible: false,
  },
  {
    id: "player.visualizer",
    title: "Visualizer",
    defaultRect: { x: 740, y: 80, width: 280, height: 200 },
    defaultVisible: false,
  },
];
