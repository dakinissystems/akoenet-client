import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { classicManifest } from "../skins/defaultManifest.js";

const SkinContext = createContext(null);

export function SkinRenderer({ skinId = "classic", children }) {
  const [manifest, setManifest] = useState(classicManifest);

  useEffect(() => {
    if (skinId === "classic") {
      setManifest(classicManifest);
      return;
    }
    import("../services/mediaApi.js")
      .then(({ mediaApi }) => mediaApi.getSkinManifest(skinId))
      .then(setManifest)
      .catch(() => setManifest(classicManifest));
  }, [skinId]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = manifest.colors ?? {};
    if (colors.text) root.style.setProperty("--dmp-text", colors.text);
    if (colors.background) root.style.setProperty("--dmp-bg", colors.background);
    if (colors.accent) root.style.setProperty("--dmp-accent", colors.accent);
    if (colors.titlebar) root.style.setProperty("--dmp-titlebar", colors.titlebar);
    if (manifest.fonts?.ui) root.style.setProperty("--dmp-font-ui", manifest.fonts.ui);
    if (manifest.fonts?.lcd) root.style.setProperty("--dmp-font-lcd", manifest.fonts.lcd);
  }, [manifest]);

  const value = useMemo(() => ({ manifest, skinId }), [manifest, skinId]);
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin() {
  return useContext(SkinContext);
}
