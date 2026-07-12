import { formatTime, totalDurationMs } from "../lib/format.js";
import { STRINGS } from "../i18n/strings.js";
import { usePlayerStore } from "../store/playerStore.jsx";

export function PlaylistWindow({ tracks, currentId, onSelect }) {
  const { state, dispatch } = usePlayerStore();
  const total = totalDurationMs(tracks);

  return (
    <div className="dmp-playlist">
      <div className="dmp-playlist__header">
        <span>{tracks.length ? STRINGS.queueSummary(tracks.length, formatTime(total)) : STRINGS.queueEmpty}</span>
        <div className="dmp-playlist__modes">
          <button
            type="button"
            className={`dmp-chip${state.shuffle ? " is-on" : ""}`}
            onClick={() => dispatch({ type: "SET_SHUFFLE", payload: !state.shuffle })}
            title={STRINGS.shuffle}
            aria-label={STRINGS.shuffle}
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
            title={state.repeat === "one" ? STRINGS.repeatOne : state.repeat === "all" ? STRINGS.repeatAll : STRINGS.repeat}
            aria-label={STRINGS.repeat}
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
              <span className="dmp-playlist__icon" aria-hidden="true">🎵</span>
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
