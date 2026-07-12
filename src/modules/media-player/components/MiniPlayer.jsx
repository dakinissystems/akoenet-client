import { formatTime } from "../lib/format.js";

export function MiniPlayer({ player, onExpand }) {
  const { currentTrack, isPlaying, loading, positionMs, togglePlay } = player;
  const durationMs = currentTrack?.durationMs || 0;
  const progress = durationMs ? Math.min(100, (positionMs / durationMs) * 100) : 0;

  return (
    <div className={`dmp-mini${isPlaying ? " dmp-mini--playing" : ""}`}>
      <button type="button" className="dmp-btn dmp-btn--primary" onClick={togglePlay} disabled={loading || !currentTrack}>
        {isPlaying ? "❚❚" : "▶"}
      </button>
      <div className="dmp-mini__body">
        <div className="dmp-mini__meta">
          <strong>{currentTrack?.title ?? "Dakinis Media"}</strong>
          <small>{currentTrack?.artist ?? "—"}</small>
        </div>
        <div className="dmp-mini__progress">
          <div className="dmp-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="dmp-mini__time">
          {formatTime(positionMs)}
          {durationMs ? ` / ${formatTime(durationMs)}` : ""}
        </div>
      </div>
      <button type="button" className="dmp-btn" onClick={onExpand} title="Expand">
        ⬜
      </button>
    </div>
  );
}
