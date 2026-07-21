import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MiniPlayer } from "./MiniPlayer.jsx";
import {
  ensurePlaybackSessionEngineHooks,
  getPlaybackSession,
  getSessionPositionMs,
  stopSession,
  subscribePlaybackSession,
  toggleSessionPlay,
} from "../services/playbackSession.js";
import "../styles/media-player.css";

/**
 * Floating mini player when audio keeps playing outside `/media`.
 */
export function GlobalMediaMiniPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [positionMs, setPositionMs] = useState(0);

  useEffect(() => {
    ensurePlaybackSessionEngineHooks();
    return subscribePlaybackSession(() => setTick((n) => n + 1));
  }, []);

  const session = getPlaybackSession();
  const onMediaRoute = location.pathname === "/media" || location.pathname.startsWith("/media/");
  const visible = Boolean(session.track) && !onMediaRoute;

  useEffect(() => {
    if (!visible || !session.isPlaying) return undefined;
    const id = setInterval(() => setPositionMs(getSessionPositionMs()), 250);
    return () => clearInterval(id);
  }, [visible, session.isPlaying, tick]);

  useEffect(() => {
    setPositionMs(getSessionPositionMs());
  }, [tick, session.track?.id]);

  const player = useMemo(
    () => ({
      currentTrack: session.track,
      isPlaying: session.isPlaying,
      loading: false,
      positionMs,
      togglePlay: toggleSessionPlay,
      stop: stopSession,
    }),
    [session.track, session.isPlaying, positionMs]
  );

  if (!visible) return null;

  return (
    <div className="dmp-global-mini" role="complementary" aria-label="Now playing">
      <MiniPlayer player={player} onExpand={() => navigate("/media")} />
      <button
        type="button"
        className="dmp-btn dmp-global-mini__stop"
        onClick={() => stopSession()}
        title="Stop"
        aria-label="Stop"
      >
        ■
      </button>
    </div>
  );
}
