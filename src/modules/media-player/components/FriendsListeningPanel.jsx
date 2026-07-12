/** Stub Fase 2 — presencia AkoeNet + salas sync */
const DEMO_FRIENDS = [
  { id: "1", name: "Christian", track: "One More Time", artist: "Daft Punk", listening: true },
  { id: "2", name: "Ana", track: null, listening: false },
];

export function FriendsListeningPanel() {
  return (
    <div className="dmp-friends">
      <div className="dmp-friends__header">Friends listening</div>
      <p className="dmp-friends__hint">📅 Próximamente: sincronización con canales AkoeNet</p>
      <ul className="dmp-friends__list">
        {DEMO_FRIENDS.map((f) => (
          <li key={f.id} className="dmp-friends__item">
            <span className={`dmp-friends__dot${f.listening ? " is-live" : ""}`} />
            <div className="dmp-friends__meta">
              <strong>{f.name}</strong>
              {f.listening ? (
                <small>{f.artist} — {f.track}</small>
              ) : (
                <small className="muted">Offline</small>
              )}
            </div>
            {f.listening ? (
              <button type="button" className="dmp-chip is-on" disabled title="Fase 2">
                Join
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
