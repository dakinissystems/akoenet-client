import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSkinManifest } from "../skins/index.js";
import { usePlayerStore } from "../store/playerStore.jsx";

const SkinContext = createContext(null);

export function SkinRenderer({ children }) {
  const { state } = usePlayerStore();
  const skinId = state.skinId || "classic";
  const [manifest, setManifest] = useState(() => getSkinManifest(skinId));

  useEffect(() => {
    setManifest(getSkinManifest(skinId));
  }, [skinId]);

  useEffect(() => {
    const root = document.documentElement;
    const c = manifest.colors ?? {};
    if (c.text) root.style.setProperty("--dmp-text", c.text);
    if (c.textDim) root.style.setProperty("--dmp-text-dim", c.textDim);
    if (c.background) root.style.setProperty("--dmp-bg", c.background);
    if (c.accent) root.style.setProperty("--dmp-accent", c.accent);
    if (c.accentSecondary) root.style.setProperty("--dmp-accent-2", c.accentSecondary);
    if (c.titlebar) root.style.setProperty("--dmp-titlebar", c.titlebar);
    if (c.border) root.style.setProperty("--dmp-border", c.border);
    if (c.glow) root.style.setProperty("--dmp-glow", c.glow);
    if (c.glowSecondary) root.style.setProperty("--dmp-glow-2", c.glowSecondary);
    if (c.desktopFrom) root.style.setProperty("--dmp-desktop-from", c.desktopFrom);
    if (c.desktopTo) root.style.setProperty("--dmp-desktop-to", c.desktopTo);
    if (c.lcdBg) root.style.setProperty("--dmp-lcd-bg", c.lcdBg);
    if (c.lcdText) root.style.setProperty("--dmp-lcd-text", c.lcdText);
    if (manifest.fonts?.ui) root.style.setProperty("--dmp-font-ui", manifest.fonts.ui);
    if (manifest.fonts?.lcd) root.style.setProperty("--dmp-font-lcd", manifest.fonts.lcd);

    return () => {
      /* vars scoped to session — restored on next skin apply */
    };
  }, [manifest]);

  const value = useMemo(() => ({ manifest, skinId }), [manifest, skinId]);
  return (
    <SkinContext.Provider value={value}>
      <div className="dmp-root" data-skin={skinId}>
        {children}
      </div>
    </SkinContext.Provider>
  );
}

export function useSkin() {
  return useContext(SkinContext);
}
