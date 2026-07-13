/** Short window ids in DB presets → media-player registry ids */
export const MEDIA_PLAYER_WINDOW_MAP = {
  player: "player.main",
  main: "player.main",
  playlist: "player.playlist",
  eq: "player.eq",
  library: "player.library",
  visualizer: "player.visualizer",
  friends: "player.friends",
  "mini-player": "player.main",
};

/**
 * @param {string} shortId
 */
export function mapMediaPlayerWindowId(shortId) {
  return MEDIA_PLAYER_WINDOW_MAP[shortId] || shortId;
}

/**
 * @param {Array<{ id: string, rect?: object, visible?: boolean }>} saved
 * @param {Array<{ id: string, title?: string, defaultRect: object, defaultVisible?: boolean }>} registry
 */
export function mergeSavedWindows(saved, registry) {
  if (!Array.isArray(saved) || !saved.length) return null;
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
}

/**
 * Apply profile opens[] when no saved pixel layout exists.
 * @param {object} profile
 * @param {string} addonId
 * @param {Array<{ id: string, title?: string, defaultRect: object, defaultVisible?: boolean }>} registry
 */
export function layoutFromProfileOpens(profile, addonId, registry) {
  const opens = profile?.windowState?.opens;
  if (!Array.isArray(opens)) return null;

  const entry = opens.find((o) => o.addonId === addonId);
  if (!entry?.windows?.length) return null;

  const visibleIds = new Set(entry.windows.map((w) => mapMediaPlayerWindowId(w)));

  return registry.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: visibleIds.has(desc.id),
    minimized: false,
    zIndex: i + 1,
  }));
}

/**
 * @param {object} apiLayout
 * @param {object} [apiLayout.profile]
 * @param {Array<{ id: string, rect?: object, visible?: boolean }>|null} [apiLayout.windows]
 * @param {string} addonId
 * @param {Array<{ id: string, title?: string, defaultRect: object, defaultVisible?: boolean }>} registry
 */
export function resolveLayoutFromApiResponse(apiLayout, addonId, registry) {
  if (apiLayout?.windows?.length) {
    return mergeSavedWindows(apiLayout.windows, registry);
  }
  if (apiLayout?.profile) {
    const fromOpens = layoutFromProfileOpens(apiLayout.profile, addonId, registry);
    if (fromOpens) return fromOpens;
  }
  return null;
}
