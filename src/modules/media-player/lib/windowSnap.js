/**
 * Media Player — re-exporta snap genérico + helpers de layout local.
 */
export {
  WINDOW_MIN,
  SNAP_THRESHOLD,
  clampRect,
  applyWindowSnap,
  applyScreenSnap,
  applyPairwiseSnap,
  constrainToViewport,
  buildAddonWindowRegistry,
  normalizeViewport,
} from "../../../workspace/desktopRuntime/windowSnap.js";

/** @typedef {{ x: number, y: number, width: number, height: number }} Rect */

/**
 * Winamp-style vertical stack: Player → Playlist → EQ
 * @param {typeof import('../windowRegistry.js').WINDOW_REGISTRY} registry
 */
export function stackLayout(registry) {
  const baseX = 48;
  let y = 56;
  const mainW = 340;
  const order = ["player.main", "player.playlist", "player.eq"];

  return registry.map((desc, i) => {
    const isStacked = order.includes(desc.id);
    let rect = { ...desc.defaultRect };
    if (isStacked) {
      const h = desc.id === "player.eq" ? 180 : desc.defaultRect.height;
      rect = { x: baseX, y, width: mainW, height: h };
      y += h - 2;
    }
    return {
      id: desc.id,
      title: desc.title,
      rect,
      visible: desc.defaultVisible ?? true,
      minimized: false,
      zIndex: i + 1,
    };
  });
}

const LAYOUT_KEY = "dmp_window_layout_v1";

/** @param {Array<{ id: string, rect: Rect, visible: boolean }>} windows */
export function persistLayout(windows) {
  try {
    const payload = windows.map(({ id, rect, visible }) => ({ id, rect, visible }));
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/**
 * @param {typeof import('../windowRegistry.js').WINDOW_REGISTRY} registry
 */
export function loadPersistedLayout(registry) {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return null;
    return registry.map((desc, i) => {
      const hit = saved.find((s) => s.id === desc.id);
      return {
        id: desc.id,
        title: desc.title,
        rect: hit?.rect ? { ...hit.rect } : { ...desc.defaultRect },
        visible: hit?.visible ?? desc.defaultVisible ?? true,
        minimized: false,
        zIndex: i + 1,
      };
    });
  } catch {
    return null;
  }
}
