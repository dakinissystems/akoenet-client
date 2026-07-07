import {
  INVITE_TEMP_EXPIRY_HOURS,
  INVITE_TEMP_MAX_USES_MULTI,
  formatInviteSummary,
  inviteFullUrl,
} from '../lib/invites'

export default function ServerSettingsInvitesPanel({
  inviteType,
  setInviteType,
  tempUsesMode,
  setTempUsesMode,
  inviteLink,
  inviteToken,
  lastInviteSummary,
  activeInvites,
  copyNotice,
  busy,
  shareOrigin,
  createInvite,
  copyText,
  revokeInvite,
  t,
}) {
  return (
    <div className="server-settings-tab-pane">
      <form onSubmit={createInvite} className="form-stack invite-create-form">
        <div>
          <label htmlFor="server-invite-type">{t('serverModal.inviteTypeLabel')}</label>
          <select
            id="server-invite-type"
            name="invite_type"
            value={inviteType}
            onChange={(e) => setInviteType(e.target.value)}
            className="select-inline"
          >
            <option value="temporary">{t('serverModal.inviteTemp')}</option>
            <option value="permanent">{t('serverModal.invitePermanent')}</option>
          </select>
          <p className="muted small invite-type-hint">
            {inviteType === 'temporary'
              ? t('serverModal.inviteTempHint', {
                  days: INVITE_TEMP_EXPIRY_HOURS / 24,
                  max: INVITE_TEMP_MAX_USES_MULTI,
                })
              : t('serverModal.invitePermanentHint')}
          </p>
        </div>

        {inviteType === 'temporary' ? (
          <fieldset className="invite-audience-fieldset">
            <legend className="invite-audience-legend">{t('serverModal.whoCanUse')}</legend>
            <label className="invite-toggle">
              <input
                id="server-invite-uses-single"
                name="temp_uses_mode"
                type="radio"
                checked={tempUsesMode === 'single'}
                onChange={() => setTempUsesMode('single')}
              />
              <span>{t('serverModal.inviteSingle')}</span>
            </label>
            <label className="invite-toggle">
              <input
                id="server-invite-uses-multi"
                name="temp_uses_mode"
                type="radio"
                checked={tempUsesMode === 'multi'}
                onChange={() => setTempUsesMode('multi')}
              />
              <span>{t('serverModal.inviteMulti', { max: INVITE_TEMP_MAX_USES_MULTI })}</span>
            </label>
          </fieldset>
        ) : null}

        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? t('serverModal.generateBusy') : t('serverModal.generateCta')}
        </button>
        <p className="muted small invite-share-explainer">{t('serverModal.inviteShareExplainer')}</p>
      </form>

      {inviteLink ? (
        <div className="invite-link-box invite-link-box-generated">
          <label htmlFor="server-invite-link-output" className="sr-only">
            {t('serverModal.inviteLinkSr')}
          </label>
          <input id="server-invite-link-output" name="invite_link" value={inviteLink} readOnly />
          <div className="invite-share-actions">
            <button type="button" className="btn ghost" onClick={() => copyText(inviteLink, t('serverModal.copyLinkOk'))}>
              {t('serverModal.copyLink')}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => inviteToken && copyText(inviteToken, t('serverModal.copyCodeOk'))}
              disabled={!inviteToken}
            >
              {t('serverModal.copyCodeOnly')}
            </button>
            {copyNotice ? (
              <span className="invite-copy-notice" role="status">
                {copyNotice}
              </span>
            ) : null}
          </div>
          {lastInviteSummary ? <p className="muted small invite-policy-echo">{lastInviteSummary}</p> : null}
        </div>
      ) : null}

      <div className="invite-list">
        <h3>{t('serverModal.activeInvites')}</h3>
        {activeInvites.length === 0 ? (
          <p className="muted small">{t('serverModal.noActiveInvites')}</p>
        ) : (
          <ul>
            {activeInvites.map((inv) => {
              const full = inviteFullUrl(shareOrigin, inv.token)
              const tok = String(inv.token || '')
              return (
                <li key={inv.id}>
                  <div className="invite-meta">
                    <input
                      id={`server-invite-active-${inv.id}`}
                      name={`invite_token_${inv.id}`}
                      value={full}
                      readOnly
                      aria-label={t('serverModal.inviteLinkSr')}
                    />
                    <small className="muted">{formatInviteSummary(inv)}</small>
                  </div>
                  <div className="invite-active-actions">
                    <button type="button" className="btn small ghost" onClick={() => copyText(full, t('serverModal.copyLinkOk'))}>
                      {t('serverModal.copyLink')}
                    </button>
                    <button
                      type="button"
                      className="btn small ghost"
                      onClick={() => tok && copyText(tok, t('serverModal.copyCodeOk'))}
                      disabled={!tok}
                    >
                      {t('serverModal.copyCode')}
                    </button>
                    <button type="button" className="btn small secondary" onClick={() => revokeInvite(inv.id)}>
                      {t('serverModal.revoke')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
