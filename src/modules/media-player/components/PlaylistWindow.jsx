import { formatTime, totalDurationMs } from "../lib/format.js";
import { usePlayerStore } from "../store/playerStore.jsx";

export function PlaylistWindow({ tracks, currentId, onSelect }) {
  const { state, dispatch } = usePlayerStore();
  const total = totalDurationMs(tracks);

  return (
    <div className="dmp-playlist">
      <div className="dmp-playlist__header">
        <span>{tracks.length} tracks · {formatTime(total)}</span>
        <div className="dmp-playlist__modes">
          <button
            type="button"
            className={`dmp-chip${state.shuffle ? " is-on" : ""}`}
            onClick={() => dispatch({ type: "SET_SHUFFLE", payload: !state.shuffle })}
            title="Shuffle"
          >
            🔀
          </button>
          <button
            type="button"
            className={`dmp-chip${state.repeat !== "off" ? " is-on" : ""}`}
            onClick={() => {
              const next = state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off";
              dispatch({ type: "SET_REPEAT", payload: next });
            }}
            title={`Repeat: ${state.repeat}`}
          >
            {state.repeat === "one" ? "🔂1" : "🔁"}
          </button>
        </div>
      </div>
      <ul className="dmp-playlist__list">
        {tracks.map((track, i) => (
          <li key={track.id}>
            <button
              type="button"
              className={`dmp-playlist__item${track.id === currentId ? " is-active" : ""}`}
              onDoubleClick={() => onSelect(track)}
              onClick={() => onSelect(track)}
            >
              <span className="dmp-playlist__num">{track.id === currentId ? "▶" : `${i + 1}.`}</span>
              <span className="dmp-playlist__icon">🎵</span>
              <span className="dmp-playlist__meta">
                <strong>{track.title}</strong>
                <small>{track.artist}{track.album ? ` · ${track.album}` : ""}</small>
              </span>
              <span className="dmp-playlist__dur">
                {track.durationMs ? formatTime(track.durationMs) : "—"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
