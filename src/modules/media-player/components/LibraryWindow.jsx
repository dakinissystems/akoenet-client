import { useMemo, useState } from "react";
import { formatTime } from "../lib/format.js";

const TABS = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "imported", label: "Imported" },
];

export function LibraryWindow({ tracks, onPlay, onAddFiles }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    let list = tracks;
    if (tab === "imported") list = list.filter((t) => t.local);
    if (tab === "recent") list = [...list].reverse().slice(0, 10);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.artist?.toLowerCase().includes(q) ||
        t.album?.toLowerCase().includes(q),
    );
  }, [tracks, query, tab]);

  return (
    <div className="dmp-library">
      <div className="dmp-library__header">
        <span>Biblioteca</span>
        {onAddFiles ? (
          <label className="dmp-library__import">
            + Import
            <input
              type="file"
              accept="audio/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) onAddFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>

      <div className="dmp-library__search">
        <span aria-hidden="true">🔍</span>
        <input
          type="search"
          placeholder="Buscar título, artista, álbum…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="dmp-library__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`dmp-chip${tab === t.id ? " is-on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="dmp-library__list">
        {filtered.length === 0 ? (
          <li className="dmp-library__empty">Sin resultados — importa archivos o usa la demo</li>
        ) : (
          filtered.map((t) => (
            <li key={t.id}>
              <button type="button" className="dmp-library__row" onDoubleClick={() => onPlay(t)} onClick={() => onPlay(t)}>
                <span className="dmp-library__cover" aria-hidden="true">♪</span>
                <span className="dmp-library__meta">
                  <strong>{t.title}</strong>
                  <small>{t.artist}{t.album ? ` · ${t.album}` : ""}</small>
                </span>
                <span className="dmp-library__dur">{t.durationMs ? formatTime(t.durationMs) : "—"}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
