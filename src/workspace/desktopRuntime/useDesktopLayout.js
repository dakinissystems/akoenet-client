import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAddonLayout, saveAddonLayout } from "./layoutApi.js";
import { resolveLayoutFromApiResponse } from "./layoutMerge.js";
import { loadPersistedLayout, persistLayout } from "../../modules/media-player/lib/windowSnap.js";
import { loadStoredProfileKey } from "./desktopProfileUtils.js";
import { emitWorkspaceEvent } from "./workspaceEventBus.js";

const SAVE_DEBOUNCE_MS = 900;

function windowsToPayload(rows) {
  return rows.map(({ id, rect, visible }) => ({ id, rect, visible }));
}

/**
 * Load/save addon window layout via Desktop Runtime API with localStorage fallback.
 *
 * @param {{
 *   addonId: string,
 *   registry: Array<{ id: string, title?: string, defaultRect: object, defaultVisible?: boolean }>,
 *   factoryLayout: () => Array<object>,
 *   profileKey?: string,
 * }} opts
 */
export function useDesktopLayout({ addonId, registry, factoryLayout, profileKey }) {
  const [windows, setWindows] = useState(() => factoryLayout());
  const [profileKeyActive, setProfileKeyActive] = useState(null);
  const [source, setSource] = useState("default");
  const saveTimer = useRef(null);
  const resolvedProfileKey = profileKey ?? loadStoredProfileKey();
  const profileKeyRef = useRef(resolvedProfileKey);
  const profileKeyFromApiRef = useRef(null);
  profileKeyRef.current = resolvedProfileKey;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let apiLayout = null;
      try {
        apiLayout = await fetchAddonLayout(addonId, profileKeyRef.current);
        if (cancelled) return;

        if (apiLayout?.profileKey) {
          profileKeyFromApiRef.current = apiLayout.profileKey;
          setProfileKeyActive(apiLayout.profileKey);
        }

        const fromApi = resolveLayoutFromApiResponse(apiLayout, addonId, registry);
        if (fromApi) {
          setWindows(fromApi);
          setSource(apiLayout?.windows?.length ? "api" : "api-preset");
          emitWorkspaceEvent("layout.restored", {
            addonId,
            profileKey: apiLayout?.profileKey || profileKeyRef.current,
            source: apiLayout?.windows?.length ? "api" : "api-preset",
            windows: fromApi,
          });
          return;
        }

        if (apiLayout?.workspaceId) {
          const local = loadPersistedLayout(registry);
          if (local) {
            setWindows(local);
            setSource("localStorage");
            const key = apiLayout.profileKey || profileKeyRef.current;
            if (key) {
              saveAddonLayout(addonId, {
                profileKey: key,
                windows: windowsToPayload(local),
              }).catch(() => {
                /* localStorage already has layout */
              });
            }
            return;
          }
          const defaults = factoryLayout();
          setWindows(defaults);
          setSource("api-default");
          const key = apiLayout.profileKey || profileKeyRef.current;
          if (key) {
            saveAddonLayout(addonId, {
              profileKey: key,
              windows: windowsToPayload(defaults),
            }).catch(() => {});
          }
          return;
        }
      } catch {
        /* offline or API unavailable */
      }

      const local = loadPersistedLayout(registry);
      if (!cancelled && local) {
        setWindows(local);
        setSource("localStorage");
        emitWorkspaceEvent("layout.restored", {
          addonId,
          profileKey: profileKeyRef.current,
          source: "localStorage",
          windows: local,
        });
        return;
      }

      if (!cancelled) {
        const defaults = factoryLayout();
        setWindows(defaults);
        setSource("default");
        emitWorkspaceEvent("layout.restored", {
          addonId,
          profileKey: profileKeyRef.current,
          source: "default",
          windows: defaults,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [addonId, registry, factoryLayout, resolvedProfileKey]);

  const flushSave = useCallback(
    (nextWindows) => {
      const payload = windowsToPayload(nextWindows);
      persistLayout(nextWindows);

      const key =
        profileKeyRef.current || profileKeyFromApiRef.current || profileKeyActive || undefined;
      if (!key) return;

      saveAddonLayout(addonId, {
        profileKey: key,
        windows: payload,
      }).catch(() => {
        /* localStorage already saved */
      });
    },
    [addonId, profileKeyActive],
  );

  const scheduleSave = useCallback(
    (nextWindows) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => flushSave(nextWindows), SAVE_DEBOUNCE_MS);
    },
    [flushSave],
  );

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const setWindowsPersisted = useCallback(
    (updater) => {
      setWindows((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  return {
    windows,
    setWindows: setWindowsPersisted,
    profileKey: profileKeyActive,
    layoutSource: source,
  };
}
