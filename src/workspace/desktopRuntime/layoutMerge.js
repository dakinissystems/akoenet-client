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

/** Preset/catalog short ids → addon window registry ids */
const ADDON_WINDOW_ALIASES = {
  calendar: {
    agenda: "calendar.agenda",
    week: "calendar.week",
    month: "calendar.month",
    detail: "calendar.detail",
  },
  kanban: {
    boards: "kanban.boards",
    board: "kanban.board",
    tasks: "kanban.task",
    task: "kanban.task",
  },
  notes: {
    wiki: "notes.list",
    list: "notes.list",
    editor: "notes.editor",
    search: "notes.search",
  },
  terminal: {
    terminal: "terminal.shell",
    shell: "terminal.shell",
    logs: "terminal.logs",
    railway: "terminal.bookmarks",
    bookmarks: "terminal.bookmarks",
  },
  devops: {
    deployments: "devops.deployments",
    logs: "devops.logs",
    metrics: "devops.services",
    services: "devops.services",
  },
  monitor: {
    overview: "monitor.overview",
    system: "monitor.system",
    services: "monitor.services",
  },
  dashboard: {
    widgets: "dashboard.widgets",
    activity: "dashboard.activity",
    quick: "dashboard.quick",
    streams: "dashboard.widgets",
    analytics: "dashboard.widgets",
  },
  "code-editor": {
    editor: "code-editor.editor",
    explorer: "code-editor.explorer",
    git: "code-editor.outline",
    outline: "code-editor.outline",
  },
};

/**
 * @param {string} addonId
 * @param {string} shortId
 */
export function mapPresetWindowId(addonId, shortId) {
  const s = String(shortId || "").trim();
  if (!s) return s;
  if (s.includes(".")) return s;
  if (addonId === "media-player") return mapMediaPlayerWindowId(s);
  return ADDON_WINDOW_ALIASES[addonId]?.[s] || `${addonId}.${s}`;
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
      minimized: hit?.minimized ?? false,
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

  const visibleIds = new Set(entry.windows.map((w) => mapPresetWindowId(addonId, w)));

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
