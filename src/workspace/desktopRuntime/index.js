export { fetchDesktopProfiles, fetchAddonLayout, saveAddonLayout } from "./layoutApi.js";
export {
  mapMediaPlayerWindowId,
  mergeSavedWindows,
  layoutFromProfileOpens,
  resolveLayoutFromApiResponse,
} from "./layoutMerge.js";
export { useDesktopLayout } from "./useDesktopLayout.js";
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
} from "./windowSnap.js";
