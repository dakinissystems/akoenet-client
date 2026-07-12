import { useRef } from "react";

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function MainWindow({ player, onToggleCompact, onOpenPlaylist, onOpenEq }) {
  const { currentTrack, isPlaying, loading, positionMs, volume, togglePlay, stop, setVolume } =
    player;
  const progress = currentTrack
    ? Math.min(100, (positionMs / (currentTrack.durationMs || 1)) * 100)
    : 0;

  return (
    <div className="dmp-main">
      <div className="dmp-lcd">
        <div className="dmp-lcd__title">{currentTrack?.title ?? "—"}</div>
        <div className="dmp-lcd__artist">{currentTrack?.artist ?? "Select a track"}</div>
        <div className="dmp-lcd__time">
          {formatTime(positionMs)}
          {currentTrack ? ` / ${formatTime(currentTrack.durationMs)}` : ""}
        </div>
      </div>

      <div className="dmp-progress">
        <div className="dmp-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="dmp-controls">
        <button type="button" className="dmp-btn" onClick={stop} title="Stop">
          ■
        </button>
        <button type="button" className="dmp-btn dmp-btn--primary" onClick={togglePlay} disabled={loading}>
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button type="button" className="dmp-btn" onClick={onOpenPlaylist} title="Playlist">
          ☰
        </button>
        <button type="button" className="dmp-btn" onClick={onOpenEq} title="EQ">
          EQ
        </button>
        <button type="button" className="dmp-btn" onClick={onToggleCompact} title="Compact">
          ─
        </button>
      </div>

      <label className="dmp-volume">
        Vol
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
