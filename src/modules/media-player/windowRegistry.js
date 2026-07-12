import { windowTitle } from "./i18n/strings.js";

export const WINDOW_REGISTRY = [
  {
    id: "player.main",
    title: windowTitle("player.main"),
    defaultRect: { x: 48, y: 56, width: 360, height: 220 },
    defaultVisible: true,
    snapTo: ["player.playlist", "player.eq"],
  },
  {
    id: "player.playlist",
    title: windowTitle("player.playlist"),
    defaultRect: { x: 48, y: 288, width: 360, height: 240 },
    defaultVisible: true,
    snapTo: ["player.main"],
  },
  {
    id: "player.eq",
    title: windowTitle("player.eq"),
    defaultRect: { x: 420, y: 56, width: 320, height: 260 },
    defaultVisible: true,
    snapTo: ["player.main"],
  },
  {
    id: "player.library",
    title: windowTitle("player.library"),
    defaultRect: { x: 420, y: 328, width: 320, height: 220 },
    defaultVisible: true,
  },
  {
    id: "player.visualizer",
    title: windowTitle("player.visualizer"),
    defaultRect: { x: 752, y: 56, width: 280, height: 200 },
    defaultVisible: false,
  },
  {
    id: "player.friends",
    title: windowTitle("player.friends"),
    defaultRect: { x: 752, y: 268, width: 280, height: 180 },
    defaultVisible: false,
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
