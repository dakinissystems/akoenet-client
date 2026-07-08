import { useServerAssistantModules, canToggleModule } from '../hooks/useServerAssistantModules'
import { assistantModuleDescription, assistantModuleName } from '../lib/assistantModuleI18n'

const MODULE_ICONS = {
  guardian: '🛡',
  welcome: '👋',
  assistant: '🤖',
  guardian_ai: '🧠',
  streamer: '📺',
  knowledge: '📚',
  reaction_roles: '🎭',
  polls: '📊',
  automation: '⚙️',
  developer: '👨‍💻',
  support: '🎫',
  events: '📅',
  business: '💼',
  games: '🎮',
  music: '🎵',
  levels: '🏆',
  economy: '🪙',
  translator: '🌐',
  meeting_ai: '🎙',
  developer_ai: '💻',
}

function categoryLabel(category, t) {
  const key = `serverAssistant.category.${category}`
  const translated = t(key)
  return translated === key ? category : translated
}

function phaseLabel(phase, t) {
  if (phase === 'future') return t('serverAssistant.phaseFuture')
  if (phase === 'growth') return t('serverAssistant.phaseGrowth')
  return null
}

export default function ServerSettingsAssistantPanel({ serverId, canManage, t }) {
  const assistant = useServerAssistantModules({ serverId, canManage, open: true })

  return (
    <div className="server-settings-tab-pane">
      <h2 className="server-settings-panel-title">{t('serverAssistant.title')}</h2>
      <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
        {t('serverAssistant.lead')}
      </p>

      {!assistant.configured ? (
        <div className="info-banner" style={{ marginBottom: '0.75rem' }}>
          {t('serverAssistant.notConfigured')}
        </div>
      ) : null}

      {assistant.warning ? (
        <div className="info-banner" style={{ marginBottom: '0.75rem' }}>
          {assistant.warning}
        </div>
      ) : null}

      {assistant.error ? <div className="error-banner inline">{assistant.error}</div> : null}
      {assistant.info ? <div className="info-banner">{assistant.info}</div> : null}

      {!canManage ? (
        <p className="muted small">{t('serverAssistant.readOnly')}</p>
      ) : null}

      {assistant.loading ? (
        <p className="muted small">{t('serverAssistant.loading')}</p>
      ) : (
        assistant.groups.map((group) => (
          <section key={group.category} className="assistant-module-section">
            <h3 className="assistant-module-section__title">{categoryLabel(group.category, t)}</h3>
            <div className="assistant-module-grid">
              {group.modules.map((mod) => {
                const icon = MODULE_ICONS[mod.key] || '✦'
                const phase = phaseLabel(mod.phase, t)
                const canToggle =
                  canManage && canToggleModule(mod)
                const busy = assistant.busyKey === mod.key

                return (
                  <article
                    key={mod.key}
                    className={`assistant-module-card${mod.enabled ? ' is-enabled' : ''}`}
                  >
                    <div className="assistant-module-card__head">
                      <span className="assistant-module-card__icon" aria-hidden>
                        {icon}
                      </span>
                      <div className="assistant-module-card__titles">
                        <strong>{assistantModuleName(mod, t)}</strong>
                        {phase ? <span className="assistant-module-card__phase">{phase}</span> : null}
                      </div>
                      <button
                        type="button"
                        className={`voice-setting-toggle-btn${mod.enabled ? ' is-active' : ''}`}
                        onClick={() => assistant.toggleModule(mod)}
                        disabled={!canToggle || busy}
                        aria-pressed={mod.enabled}
                        title={
                          !canToggle && mod.phase === 'future'
                            ? t('serverAssistant.phaseFuture')
                            : undefined
                        }
                      >
                        {busy
                          ? t('serverAssistant.saving')
                          : mod.enabled
                            ? t('serverAssistant.on')
                            : t('serverAssistant.off')}
                      </button>
                    </div>
                    {assistantModuleDescription(mod, t) ? (
                      <p className="muted small assistant-module-card__desc">
                        {assistantModuleDescription(mod, t)}
                      </p>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
