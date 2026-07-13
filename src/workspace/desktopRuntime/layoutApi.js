import api from "../../services/api.js";

/** @typedef {{ id: string, rect: { x: number, y: number, width: number, height: number }, visible: boolean }} SavedWindow */

export async function fetchDesktopProfiles() {
  const { data } = await api.get("/workspace/desktop/profiles");
  return data;
}

/**
 * @param {string} addonId
 * @param {string} [profileKey]
 */
export async function fetchAddonLayout(addonId, profileKey) {
  const params = profileKey ? { profileKey } : undefined;
  const { data } = await api.get(`/workspace/desktop/layout/${addonId}`, { params });
  return data;
}

/**
 * @param {string} addonId
 * @param {{ profileKey?: string, windows: SavedWindow[] }} payload
 */
export async function saveAddonLayout(addonId, payload) {
  const { data } = await api.put(`/workspace/desktop/layout/${addonId}`, payload);
  return data;
}
