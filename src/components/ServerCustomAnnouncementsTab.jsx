export default function ServerCustomAnnouncementsTab({
  serverId,
  canManage,
  announcements,
  textChannels,
  busy,
  annTitle,
  setAnnTitle,
  annBody,
  setAnnBody,
  publishChannelId,
  setPublishChannelId,
  addAnnouncement,
  removeAnnouncement,
  publishAnnouncement,
  t,
  sectionClass,
  sid,
}) {
  return (
    <section className={sectionClass} aria-labelledby={`srv-settings-ann-${sid}`}>
      <h2 id={`srv-settings-ann-${sid}`} className="server-settings-panel-title">
        {t('serverAutomations.announcementsTitle')}
      </h2>
      <p className="muted small">{t('serverAutomations.announcementsLead')}</p>
      {announcements.length === 0 ? (
        <p className="muted small">{t('serverAutomations.noAnnouncements')}</p>
      ) : (
        <ul className="server-custom-list">
          {announcements.map((an) => (
            <li key={an.id}>
              <strong>{an.title}</strong>
              {canManage ? (
                <>
                  <button
                    type="button"
                    className="btn small ghost"
                    disabled={busy}
                    onClick={() => removeAnnouncement(an.id)}
                  >
                    {t('serverAutomations.delete')}
                  </button>
                  <div className="server-custom-publish-row">
                    <select
                      aria-label={t('serverAutomations.channelForAnnouncement')}
                      value={publishChannelId}
                      onChange={(e) => setPublishChannelId(e.target.value)}
                      className="select-inline"
                    >
                      <option value="">{t('serverAutomations.channelPlaceholder')}</option>
                      {textChannels.map((ch) => (
                        <option key={ch.id} value={String(ch.id)}>
                          #{ch.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn small secondary"
                      disabled={busy}
                      onClick={() => publishAnnouncement(an.id)}
                    >
                      {t('serverAutomations.publish')}
                    </button>
                  </div>
                </>
              ) : null}
              <pre className="server-custom-preview">{an.body}</pre>
            </li>
          ))}
        </ul>
      )}
      {canManage ? (
        <form className="form-stack server-custom-form" onSubmit={addAnnouncement}>
          <label htmlFor={`srv-ann-title-${serverId}`}>{t('serverAutomations.titleLabel')}</label>
          <input
            id={`srv-ann-title-${serverId}`}
            name="announcement_title"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            aria-label={t('serverAutomations.titleLabel')}
          />
          <label htmlFor={`srv-ann-body-${serverId}`}>{t('serverAutomations.bodyLabel')}</label>
          <textarea
            id={`srv-ann-body-${serverId}`}
            name="announcement_body"
            value={annBody}
            onChange={(e) => setAnnBody(e.target.value)}
            rows={4}
            aria-label={t('serverAutomations.bodyLabel')}
          />
          <button type="submit" className="btn primary small" disabled={busy}>
            {t('serverAutomations.saveAnnouncement')}
          </button>
        </form>
      ) : (
        <p className="muted small">{t('serverAutomations.announcementsReadOnly')}</p>
      )}
    </section>
  )
}
