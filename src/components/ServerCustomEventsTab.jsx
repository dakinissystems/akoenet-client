export default function ServerCustomEventsTab({
  serverId,
  canManage,
  canCreateEvents = false,
  events,
  busy,
  evTitle,
  setEvTitle,
  evDesc,
  setEvDesc,
  evStart,
  setEvStart,
  evEnd,
  setEvEnd,
  addEvent,
  removeEvent,
  t,
  sectionClass,
  sid,
  unlockAt = 15,
}) {
  const canAdd = Boolean(canManage || canCreateEvents)
  return (
    <section className={sectionClass} aria-labelledby={`srv-settings-events-${sid}`}>
      <h2 id={`srv-settings-events-${sid}`} className="server-settings-panel-title">
        {t('serverAutomations.eventsTitle')}
      </h2>
      <p className="muted small">{t('serverAutomations.eventsLead')}</p>
      {events.length === 0 ? (
        <p className="muted small">{t('serverAutomations.noEvents')}</p>
      ) : (
        <ul className="server-custom-list">
          {events.map((ev) => (
            <li key={ev.id}>
              <strong>{ev.title}</strong>
              <span className="muted small server-custom-event-time">
                {new Date(ev.starts_at).toLocaleString()}
                {ev.ends_at ? ` — ${new Date(ev.ends_at).toLocaleString()}` : ''}
              </span>
              {canManage ? (
                <button
                  type="button"
                  className="btn small ghost"
                  disabled={busy}
                  onClick={() => removeEvent(ev.id)}
                >
                  {t('serverAutomations.remove')}
                </button>
              ) : null}
              {ev.description ? <pre className="server-custom-preview">{ev.description}</pre> : null}
            </li>
          ))}
        </ul>
      )}
      {canAdd ? (
        <form className="form-stack server-custom-form" onSubmit={addEvent}>
          <label htmlFor={`srv-ev-title-${serverId}`}>{t('serverAutomations.titleLabel')}</label>
          <input
            id={`srv-ev-title-${serverId}`}
            name="event_title"
            value={evTitle}
            onChange={(e) => setEvTitle(e.target.value)}
            aria-label={t('serverAutomations.titleLabel')}
          />
          <label htmlFor={`srv-ev-desc-${serverId}`}>{t('serverAutomations.descOptional')}</label>
          <textarea
            id={`srv-ev-desc-${serverId}`}
            name="event_description"
            value={evDesc}
            onChange={(e) => setEvDesc(e.target.value)}
            rows={3}
            aria-label={t('serverAutomations.descOptional')}
          />
          <label htmlFor={`srv-ev-start-${serverId}`}>{t('serverAutomations.startsLabel')}</label>
          <input
            id={`srv-ev-start-${serverId}`}
            name="event_starts"
            type="datetime-local"
            value={evStart}
            onChange={(e) => setEvStart(e.target.value)}
            aria-label={t('serverAutomations.startsLabel')}
          />
          <label htmlFor={`srv-ev-end-${serverId}`}>{t('serverAutomations.endsOptional')}</label>
          <input
            id={`srv-ev-end-${serverId}`}
            name="event_ends"
            type="datetime-local"
            value={evEnd}
            onChange={(e) => setEvEnd(e.target.value)}
            aria-label={t('serverAutomations.endsOptional')}
          />
          <button type="submit" className="btn primary small" disabled={busy}>
            {t('serverAutomations.addEvent')}
          </button>
          {!canManage && canCreateEvents ? (
            <p className="muted small">{t('serverAutomations.eventsUnlockHint', { level: unlockAt })}</p>
          ) : null}
        </form>
      ) : (
        <p className="muted small">{t('serverAutomations.eventsReadOnly', { level: unlockAt })}</p>
      )}
    </section>
  )
}
