export function MiniPlayer({ player, onExpand }) {
  const { currentTrack, isPlaying, togglePlay } = player;
  return (
    <div className="dmp-mini">
      <button type="button" className="dmp-btn dmp-btn--primary" onClick={togglePlay}>
        {isPlaying ? "❚❚" : "▶"}
      </button>
      <div className="dmp-mini__meta">
        <strong>{currentTrack?.title ?? "Dakinis MP"}</strong>
        <small>{currentTrack?.artist ?? "—"}</small>
      </div>
      <button type="button" className="dmp-btn" onClick={onExpand}>
        ⬜
      </button>
    </div>
  );
}
