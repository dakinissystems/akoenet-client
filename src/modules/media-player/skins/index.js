import { classicManifest } from "./classicManifest.js";
import { neonManifest } from "./neonManifest.js";
import { dakinisManifest } from "./dakinisManifest.js";

/** @type {Record<string, typeof classicManifest>} */
export const SKIN_REGISTRY = {
  classic: classicManifest,
  neon: neonManifest,
  dakinis: dakinisManifest,
};

export const SKIN_LIST = Object.values(SKIN_REGISTRY);

export function getSkinManifest(id) {
  return SKIN_REGISTRY[id] ?? classicManifest;
}

/** @deprecated use classicManifest */
export { classicManifest } from "./classicManifest.js";
