/** @typedef {{ x: number, y: number, width: number, height: number }} Rect */
/** @typedef {{ width: number; height: number; topBar?: number; bottom?: number }} SnapViewport */

export const WINDOW_MIN = { width: 220, height: 120 };
export const SNAP_THRESHOLD = 24;

/** @param {Rect} rect @param {{ width?: number, height?: number }} [min] */
export function clampRect(rect, min = WINDOW_MIN) {
  return {
    ...rect,
    width: Math.max(min.width ?? WINDOW_MIN.width, rect.width),
    height: Math.max(min.height ?? WINDOW_MIN.height, rect.height),
  };
}

/**
 * @param {SnapViewport | { width: number; height: number }} viewport
 */
export function normalizeViewport(viewport) {
  const width = viewport.width ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
  const height = viewport.height ?? (typeof window !== "undefined" ? window.innerHeight : 800);
  return {
    width,
    height,
    topBar: viewport.topBar ?? 0,
    bottom: viewport.bottom ?? 0,
  };
}

/**
 * Snap a bordes del contenedor: izquierda/derecha (50%), arriba (maximizar).
 * @param {Rect} rect
 * @param {SnapViewport} viewport
 */
export function applyScreenSnap(rect, viewport) {
  const { width: vw, height: vh, topBar, bottom } = normalizeViewport(viewport);
  const t = SNAP_THRESHOLD;
  const workTop = topBar;
  const workH = Math.max(WINDOW_MIN.height, vh - topBar - bottom);

  if (rect.y <= workTop + t) {
    return clampRect({ x: 0, y: workTop, width: vw, height: workH });
  }

  if (rect.x <= t) {
    return clampRect({
      x: 0,
      y: workTop,
      width: Math.max(WINDOW_MIN.width, Math.floor(vw / 2)),
      height: workH,
    });
  }

  if (rect.x + rect.width >= vw - t) {
    const half = Math.max(WINDOW_MIN.width, Math.ceil(vw / 2));
    return clampRect({
      x: vw - half,
      y: workTop,
      width: half,
      height: workH,
    });
  }

  return rect;
}

/**
 * Snap entre ventanas según registry.snapTo (stack / dock).
 * @param {string} movedId
 * @param {Rect} rect
 * @param {Array<{ id: string, rect: Rect }>} windows
 * @param {Array<{ id: string, snapTo?: string[] }>} registry
 */
export function applyPairwiseSnap(movedId, rect, windows, registry) {
  const desc = registry.find((d) => d.id === movedId);
  if (!desc?.snapTo?.length) return rect;

  let snapped = { ...rect };

  for (const targetId of desc.snapTo) {
    const target = windows.find((w) => w.id === targetId);
    if (!target) continue;

    const tr = target.rect;
    const t = SNAP_THRESHOLD;

    const nearStackBelow =
      Math.abs(snapped.y - (tr.y + tr.height)) < t && Math.abs(snapped.x - tr.x) < t * 2;
    if (nearStackBelow) {
      snapped = {
        ...snapped,
        x: tr.x,
        y: tr.y + tr.height - 2,
        width: Math.max(snapped.width, tr.width),
      };
      continue;
    }

    const nearStackAbove =
      Math.abs(snapped.y + snapped.height - tr.y) < t && Math.abs(snapped.x - tr.x) < t * 2;
    if (nearStackAbove) {
      snapped = {
        ...snapped,
        x: tr.x,
        y: tr.y - snapped.height + 2,
        width: Math.max(snapped.width, tr.width),
      };
      continue;
    }

    const nearDockRight =
      Math.abs(snapped.x - (tr.x + tr.width)) < t && Math.abs(snapped.y - tr.y) < t * 2;
    if (nearDockRight) {
      snapped = {
        ...snapped,
        x: tr.x + tr.width - 2,
        y: tr.y,
        height: Math.max(snapped.height, tr.height),
      };
      continue;
    }

    const nearDockLeft =
      Math.abs(snapped.x + snapped.width - tr.x) < t && Math.abs(snapped.y - tr.y) < t * 2;
    if (nearDockLeft) {
      snapped = {
        ...snapped,
        x: tr.x - snapped.width + 2,
        y: tr.y,
        height: Math.max(snapped.height, tr.height),
      };
    }
  }

  return clampRect(snapped);
}

/**
 * Combina snap de pantalla + ventanas vecinas.
 * @param {string} movedId
 * @param {Rect} rect
 * @param {Array<{ id: string, rect: Rect }>} windows
 * @param {Array<{ id: string, snapTo?: string[] }>} registry
 * @param {SnapViewport} viewport
 */
export function applyWindowSnap(movedId, rect, windows, registry, viewport) {
  const vp = normalizeViewport(viewport);
  const withScreen = applyScreenSnap(rect, vp);
  const screenChanged =
    withScreen.x !== rect.x ||
    withScreen.y !== rect.y ||
    withScreen.width !== rect.width ||
    withScreen.height !== rect.height;

  if (screenChanged) return clampRect(withScreen);

  const siblings = windows.map((w) => (w.id === movedId ? { ...w, rect } : w));
  return applyPairwiseSnap(movedId, rect, siblings, registry);
}

/**
 * Registry con snapTo entre ventanas vecinas del addon.
 * @param {string[]} windowIds
 */
export function buildAddonWindowRegistry(windowIds) {
  return windowIds.map((id, index) => {
    const neighbors = [];
    if (index > 0) neighbors.push(windowIds[index - 1]);
    if (index < windowIds.length - 1) neighbors.push(windowIds[index + 1]);
    if (index > 1) neighbors.push(windowIds[0]);
    return { id, snapTo: [...new Set(neighbors)] };
  });
}

/**
 * Limita rect dentro del viewport de trabajo.
 * @param {Rect} rect
 * @param {SnapViewport} viewport
 */
export function constrainToViewport(rect, viewport) {
  const { width: vw, height: vh, topBar, bottom } = normalizeViewport(viewport);
  const maxY = vh - bottom - rect.height;
  return clampRect({
    ...rect,
    x: Math.max(0, Math.min(rect.x, vw - rect.width)),
    y: Math.max(topBar, Math.min(rect.y, maxY)),
  });
}
