export default function ServerCustomCommandsTab({
  serverId,
  canManage,
  commands,
  busy,
  cmdName,
  setCmdName,
  cmdResponse,
  setCmdResponse,
  cmdActionType,
  setCmdActionType,
  cmdActionValue,
  setCmdActionValue,
  addCommand,
  removeCommand,
  t,
  sectionClass,
  sid,
}) {
  return (
    <section className={sectionClass} aria-labelledby={`srv-settings-cmd-${sid}`}>
      <h2 id={`srv-settings-cmd-${sid}`} className="server-settings-panel-title">
        {t('serverAutomations.commandsTitle')}
      </h2>
      <p className="muted small">{t('serverAutomations.commandsLead')}</p>
      {commands.length === 0 ? (
        <p className="muted small">{t('serverAutomations.noCommandsYet')}</p>
      ) : (
        <ul className="server-custom-list">
          {commands.map((c) => (
            <li key={c.id}>
              <code className="inline-code">!{c.command_name}</code>
              {canManage ? (
                <button
                  type="button"
                  className="btn small ghost"
                  disabled={busy}
                  onClick={() => removeCommand(c.id)}
                >
                  {t('serverAutomations.remove')}
                </button>
              ) : null}
              <pre className="server-custom-preview">{c.response}</pre>
              {c.action_type && c.action_type !== 'none' ? (
                <div className="muted small">
                  Action: <code className="inline-code">{c.action_type}</code>
                  {c.action_value ? ` (${c.action_value})` : ''}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {canManage ? (
        <form className="form-stack server-custom-form" onSubmit={addCommand}>
          <label htmlFor={`srv-cmd-name-${serverId}`}>{t('serverAutomations.newCommandLabel')}</label>
          <input
            id={`srv-cmd-name-${serverId}`}
            name="command_name"
            value={cmdName}
            onChange={(e) => setCmdName(e.target.value)}
            placeholder={t('serverAutomations.cmdNamePh')}
            aria-label={t('serverAutomations.newCommandLabel')}
            autoComplete="off"
          />
          <label htmlFor={`srv-cmd-resp-${serverId}`}>{t('serverAutomations.replyTextLabel')}</label>
          <textarea
            id={`srv-cmd-resp-${serverId}`}
            name="command_response"
            value={cmdResponse}
            onChange={(e) => setCmdResponse(e.target.value)}
            rows={4}
            placeholder={t('serverAutomations.replyTextPh')}
            aria-label={t('serverAutomations.replyTextLabel')}
          />
          <label htmlFor={`srv-cmd-action-${serverId}`}>Action</label>
          <select
            id={`srv-cmd-action-${serverId}`}
            name="command_action"
            value={cmdActionType}
            onChange={(e) => setCmdActionType(e.target.value)}
            aria-label={t('serverAutomations.actionLabel', { defaultValue: 'Action' })}
          >
            <option value="none">none</option>
            <option value="ban">ban first argument user</option>
          </select>
          <label htmlFor={`srv-cmd-action-value-${serverId}`}>Action value (optional)</label>
          <input
            id={`srv-cmd-action-value-${serverId}`}
            name="command_action_value"
            value={cmdActionValue}
            onChange={(e) => setCmdActionValue(e.target.value)}
            placeholder="Reason used by ban action"
            aria-label={t('serverAutomations.actionValueLabel', { defaultValue: 'Action value (optional)' })}
            autoComplete="off"
          />
          <button type="submit" className="btn primary small" disabled={busy}>
            {t('serverAutomations.addCommand')}
          </button>
        </form>
      ) : (
        <p className="muted small">{t('serverAutomations.commandsReadOnly')}</p>
      )}
    </section>
  )
}
