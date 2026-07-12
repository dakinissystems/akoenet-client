export function PlaylistWindow({ tracks, currentId, onSelect }) {
  return (
    <div className="dmp-playlist">
      <ul className="dmp-playlist__list">
        {tracks.map((track, i) => (
          <li key={track.id}>
            <button
              type="button"
              className={`dmp-playlist__item${track.id === currentId ? " is-active" : ""}`}
              onDoubleClick={() => onSelect(track)}
              onClick={() => onSelect(track)}
            >
              <span className="dmp-playlist__num">{i + 1}.</span>
              <span className="dmp-playlist__meta">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              <span className="dmp-playlist__dur">
                {track.durationMs ? `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs / 1000) % 60)).padStart(2, "0")}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
