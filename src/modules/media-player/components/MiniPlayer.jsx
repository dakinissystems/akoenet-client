import { formatTime } from "../lib/format.js";
import { STRINGS } from "../i18n/strings.js";

export function MiniPlayer({ player, onExpand }) {
  const { currentTrack, isPlaying, loading, positionMs, togglePlay } = player;
  const durationMs = currentTrack?.durationMs || 0;
  const progress = durationMs ? Math.min(100, (positionMs / durationMs) * 100) : 0;

  return (
    <div className={`dmp-mini${isPlaying ? " dmp-mini--playing" : ""}`}>
      <button
        type="button"
        className="dmp-btn dmp-btn--primary"
        onClick={togglePlay}
        disabled={loading || !currentTrack}
        aria-label={isPlaying ? STRINGS.pause : STRINGS.play}
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>
      <div className="dmp-mini__body">
        <div className="dmp-mini__meta">
          <strong>{currentTrack?.title ?? STRINGS.appName}</strong>
          <small>{currentTrack?.artist ?? STRINGS.chooseTrack}</small>
        </div>
        <div className="dmp-mini__progress">
          <div className="dmp-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="dmp-mini__time">
          {formatTime(positionMs)}
          {durationMs ? ` / ${formatTime(durationMs)}` : ""}
        </div>
      </div>
      <button type="button" className="dmp-btn" onClick={onExpand} title={STRINGS.expand} aria-label={STRINGS.expand}>
        ⬜
      </button>
    </div>
  );
}
