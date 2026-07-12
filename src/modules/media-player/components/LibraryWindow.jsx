export function LibraryWindow({ tracks, onPlay, onAddFiles }) {
  return (
    <div className="dmp-library">
      <div className="dmp-library__header">
        <span>Biblioteca</span>
        {onAddFiles ? (
          <label className="dmp-library__import">
            Añadir archivos
            <input
              type="file"
              accept="audio/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) onAddFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        ) : null}
      </div>
      <table className="dmp-library__table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Artista</th>
            <th>Álbum</th>
          </tr>
        </thead>
        <tbody>
          {tracks.length === 0 ? (
            <tr>
              <td colSpan={3} className="dmp-library__empty">
                Sin pistas — importa archivos o usa la demo
              </td>
            </tr>
          ) : (
            tracks.map((t) => (
              <tr
                key={t.id}
                onDoubleClick={() => onPlay(t)}
                onKeyDown={(e) => e.key === 'Enter' && onPlay(t)}
                role="button"
                tabIndex={0}
              >
                <td>{t.title}</td>
                <td>{t.artist}</td>
                <td>{t.album}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
