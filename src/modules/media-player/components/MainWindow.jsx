import { memo, useCallback } from "react";
import { formatTime } from "../lib/format.js";
import { STRINGS } from "../i18n/strings.js";

export const MainWindow = memo(function MainWindow({
  player,
  onToggleCompact,
  onOpenPlaylist,
  onOpenSound,
}) {
  const {
    currentTrack,
    isPlaying,
    loading,
    positionMs,
    volume,
    togglePlay,
    stop,
    seek,
    playNext,
    playPrevious,
    setVolume,
  } = player;

  const durationMs = currentTrack?.durationMs || 0;
  const progress = durationMs ? Math.min(100, (positionMs / durationMs) * 100) : 0;

  const statusLabel = loading
    ? STRINGS.loading
    : isPlaying
      ? STRINGS.nowPlaying
      : currentTrack
        ? STRINGS.paused
        : STRINGS.ready;

  const onSeek = useCallback(
    (e) => {
      if (!durationMs) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(Math.floor(ratio * durationMs));
    },
    [durationMs, seek],
  );

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
        <div className="dmp-lcd__label">{STRINGS.nowPlaying}</div>
        <div className="dmp-lcd__title">{currentTrack?.title ?? "—"}</div>
        <div className="dmp-lcd__artist">{currentTrack?.artist ?? STRINGS.chooseTrack}</div>
        {!currentTrack ? <div className="dmp-lcd__hint">{STRINGS.tapToPlay}</div> : null}
      </div>

      <div className="dmp-progress dmp-progress--interactive">
        <button
          type="button"
          className="dmp-progress__track"
          onClick={onSeek}
          disabled={!currentTrack || !durationMs}
          aria-label="Posición en la canción"
        >
          <span className="dmp-progress__bar" style={{ width: `${progress}%` }}>
            <span className="dmp-progress__knob" />
          </span>
        </button>
        <div className="dmp-progress__times">
          <span>{formatTime(positionMs)}</span>
          <span>{durationMs ? formatTime(durationMs) : "—"}</span>
        </div>
      </div>

      <div className="dmp-controls">
        <button type="button" className="dmp-btn" onClick={playPrevious} disabled={!currentTrack} title={STRINGS.previous} aria-label={STRINGS.previous}>
          ⏮
        </button>
        <button type="button" className="dmp-btn" onClick={stop} title={STRINGS.stop} aria-label={STRINGS.stop}>
          ■
        </button>
        <button
          type="button"
          className="dmp-btn dmp-btn--primary"
          onClick={togglePlay}
          disabled={loading || !currentTrack}
          title={isPlaying ? STRINGS.pause : STRINGS.play}
          aria-label={isPlaying ? STRINGS.pause : STRINGS.play}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button type="button" className="dmp-btn" onClick={playNext} disabled={!currentTrack} title={STRINGS.next} aria-label={STRINGS.next}>
          ⏭
        </button>
        <button type="button" className="dmp-btn" onClick={onOpenPlaylist} title={STRINGS.openQueue} aria-label={STRINGS.openQueue}>
          ☰
        </button>
        <button type="button" className="dmp-btn" onClick={onOpenSound} title={STRINGS.openSound} aria-label={STRINGS.openSound}>
          ♪
        </button>
        <button type="button" className="dmp-btn" onClick={onToggleCompact} title={STRINGS.miniPlayer} aria-label={STRINGS.miniPlayer}>
          ─
        </button>
      </div>

      <label className="dmp-volume">
        {STRINGS.volume}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label={STRINGS.volume}
        />
      </label>
    </div>
  );
});
