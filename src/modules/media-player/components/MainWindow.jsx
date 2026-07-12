import { formatTime, inferTrackFormat } from "../lib/format.js";

export function MainWindow({ player, onToggleCompact, onOpenPlaylist, onOpenEq }) {
  const { currentTrack, isPlaying, loading, positionMs, volume, togglePlay, stop, setVolume } =
    player;

  const durationMs = currentTrack?.durationMs || 0;
  const progress = durationMs ? Math.min(100, (positionMs / durationMs) * 100) : 0;
  const fmt = inferTrackFormat(currentTrack?.sourceRef, currentTrack?.local);
  const statusLabel = loading ? "Loading…" : isPlaying ? "Playing" : currentTrack ? "Paused" : "Ready";

  return (
    <div className={`dmp-main${isPlaying ? " dmp-main--playing" : ""}`}>
      <div className="dmp-main__status-row">
        <span className="dmp-main__status">{statusLabel}</span>
        {isPlaying ? (
          <span className="dmp-main__viz-bars" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        ) : null}
      </div>

      <div className="dmp-lcd">
        <div className="dmp-lcd__label">NOW PLAYING</div>
        <div className="dmp-lcd__title">{currentTrack?.title ?? "—"}</div>
        <div className="dmp-lcd__artist">{currentTrack?.artist ?? "Select a track or drop a file"}</div>
        {currentTrack?.album ? <div className="dmp-lcd__album">{currentTrack.album}</div> : null}
      </div>

      <div className="dmp-progress dmp-progress--interactive">
        <div className="dmp-progress__track">
          <div className="dmp-progress__bar" style={{ width: `${progress}%` }}>
            <span className="dmp-progress__knob" />
          </div>
        </div>
        <div className="dmp-progress__times">
          <span>{formatTime(positionMs)}</span>
          <span>{durationMs ? formatTime(durationMs) : "—"}</span>
        </div>
      </div>

      {currentTrack ? (
        <div className="dmp-tech">
          <span>{fmt.codec}</span>
          <span>{fmt.bitrate}</span>
          <span>{fmt.sampleRate}</span>
          <span>{fmt.channels}</span>
        </div>
      ) : null}

      <div className="dmp-controls">
        <button type="button" className="dmp-btn" onClick={stop} title="Stop">
          ■
        </button>
        <button type="button" className="dmp-btn dmp-btn--primary" onClick={togglePlay} disabled={loading || !currentTrack}>
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
