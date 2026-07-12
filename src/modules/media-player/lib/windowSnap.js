/** @typedef {{ x: number, y: number, width: number, height: number }} Rect */

export const WINDOW_MIN = { width: 220, height: 120 };

/** @param {Rect} rect @param {{ width?: number, height?: number }} [min] */
export function clampRect(rect, min = WINDOW_MIN) {
  return {
    ...rect,
    width: Math.max(min.width ?? WINDOW_MIN.width, rect.width),
    height: Math.max(min.height ?? WINDOW_MIN.height, rect.height),
  };
}

const SNAP_THRESHOLD = 24;

/**
 * @param {string} movedId
 * @param {Rect} rect
 * @param {Array<{ id: string, rect: Rect }>} windows
 * @param {Array<{ id: string, snapTo?: string[] }>} registry
 */
export function applyWindowSnap(movedId, rect, windows, registry) {
  const desc = registry.find((d) => d.id === movedId);
  if (!desc?.snapTo?.length) return rect;

  let snapped = { ...rect };

  for (const targetId of desc.snapTo) {
    const target = windows.find((w) => w.id === targetId);
    if (!target) continue;

    const tr = target.rect;

    // Stack below (playlist under player)
    if (
      movedId === "player.playlist" &&
      targetId === "player.main" &&
      Math.abs(snapped.x - tr.x) < SNAP_THRESHOLD
    ) {
      snapped = {
        ...snapped,
        x: tr.x,
        width: tr.width,
        y: tr.y + tr.height - 2,
      };
      continue;
    }

    if (
      movedId === "player.main" &&
      targetId === "player.playlist" &&
      Math.abs(snapped.x - tr.x) < SNAP_THRESHOLD
    ) {
      snapped = {
        ...snapped,
        x: tr.x,
        width: tr.width,
        y: tr.y - snapped.height + 2,
      };
      continue;
    }

    // Dock to the right (EQ beside player)
    if (
      (movedId === "player.eq" && targetId === "player.main") ||
      (movedId === "player.main" && targetId === "player.eq")
    ) {
      const beside =
        movedId === "player.eq"
          ? { x: tr.x + tr.width - 2, y: tr.y, height: tr.height }
          : { x: tr.x - snapped.width + 2, y: tr.y, height: tr.height };

      if (
        Math.abs(snapped.y - beside.y) < SNAP_THRESHOLD ||
        Math.abs(snapped.x - (movedId === "player.eq" ? tr.x + tr.width : tr.x - snapped.width)) <
          SNAP_THRESHOLD
      ) {
        snapped = { ...snapped, ...beside, width: snapped.width };
      }
    }
  }

  return snapped;
}

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
