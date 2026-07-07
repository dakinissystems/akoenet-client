import { DARK_THEME, LIGHT_THEME, sanitizeFull, saveTheme, applyTheme } from '../../lib/themePreferences'

export default function UserSettingsAppearanceSection(props) {
  const { t, user, uiTheme, setUiTheme, accentColor, setInfo } = props

  return (
    <div className="form-stack appearance-theme-panel">
      <p className="muted small" style={{ margin: '0 0 0.5rem' }}>
        {t('userSettings.appearance.panelIntro')}
      </p>
      <div className="theme-mode-row" role="group" aria-label={t('userSettings.appearance.modeAria')}>
        {[
          { id: 'system', label: t('userSettings.appearance.modeSystem') },
          { id: 'light', label: t('userSettings.appearance.modeLight') },
          { id: 'dark', label: t('userSettings.appearance.modeDark') },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`theme-mode-btn ${uiTheme.colorMode === id ? 'is-active' : ''}`}
            onClick={() => {
              if (id === 'system') {
                setUiTheme((prev) => ({ ...prev, colorMode: 'system' }))
                return
              }
              if (id === 'light') {
                setUiTheme(sanitizeFull({ colorMode: 'light', ...LIGHT_THEME }))
                return
              }
              setUiTheme(sanitizeFull({ colorMode: 'dark', ...DARK_THEME }))
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {uiTheme.colorMode === 'system' && (
        <p className="info-banner inline" style={{ marginBottom: '0.65rem' }}>
          {t('userSettings.appearance.systemPickModeHint')}
        </p>
      )}
      {[
        { key: 'bg', labelKey: 'labelBg' },
        { key: 'panel', labelKey: 'labelPanel' },
        { key: 'rail', labelKey: 'labelRail' },
        { key: 'text', labelKey: 'labelText' },
        { key: 'muted', labelKey: 'labelMuted' },
        { key: 'echonet', labelKey: 'labelEchonet' },
        { key: 'danger', labelKey: 'labelDanger' },
      ].map(({ key, labelKey }) => {
        const hex = uiTheme[key]
        const ok = /^#([0-9a-fA-F]{6})$/.test(hex || '')
        const label = t(`userSettings.appearance.${labelKey}`)
        return (
          <label key={key} className="theme-color-row">
            <span className="theme-color-label">{label}</span>
            <div className="theme-color-inputs">
              <input
                type="color"
                aria-label={t('userSettings.appearance.colorPickerAria', { label })}
                value={ok ? hex : '#000000'}
                disabled={uiTheme.colorMode === 'system'}
                onChange={(e) => setUiTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                className="theme-color-swatch"
              />
              <input
                type="text"
                value={hex}
                disabled={uiTheme.colorMode === 'system'}
                onChange={(e) => setUiTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                maxLength={7}
                placeholder={t('userSettings.appearance.hexPlaceholder')}
                className="theme-color-hex"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </label>
        )
      })}
      <label className="theme-color-row">
        <span className="theme-color-label">{t('userSettings.appearance.labelBorder')}</span>
        <div className="theme-color-inputs">
          <input
            type="color"
            aria-label={t('userSettings.appearance.borderColorAria')}
            value={/^#([0-9a-fA-F]{6})$/.test(uiTheme.borderColor || '') ? uiTheme.borderColor : '#ffffff'}
            disabled={uiTheme.colorMode === 'system'}
            onChange={(e) => setUiTheme((prev) => ({ ...prev, borderColor: e.target.value }))}
            className="theme-color-swatch"
          />
          <input
            type="text"
            value={uiTheme.borderColor}
            disabled={uiTheme.colorMode === 'system'}
            onChange={(e) => setUiTheme((prev) => ({ ...prev, borderColor: e.target.value }))}
            maxLength={7}
            placeholder={t('userSettings.appearance.hexPlaceholder')}
            className="theme-color-hex"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </label>
      <div className="theme-border-opacity-row">
        <label htmlFor="theme-border-opacity">
          {t('userSettings.appearance.borderVisibility', { pct: uiTheme.borderOpacity })}
        </label>
        <input
          id="theme-border-opacity"
          type="range"
          min={0}
          max={40}
          value={uiTheme.borderOpacity}
          disabled={uiTheme.colorMode === 'system'}
          onChange={(e) =>
            setUiTheme((prev) => ({ ...prev, borderOpacity: Number(e.target.value) }))
          }
        />
      </div>
      <div className="appearance-theme-actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            let next
            if (uiTheme.colorMode === 'system') {
              next = sanitizeFull({ colorMode: 'dark', ...DARK_THEME })
            } else if (uiTheme.colorMode === 'light') {
              next = sanitizeFull({ colorMode: 'light', ...LIGHT_THEME })
            } else {
              next = sanitizeFull({ colorMode: 'dark', ...DARK_THEME })
            }
            setUiTheme(next)
            saveTheme(user?.id, next)
            applyTheme(next, { accentColor: accentColor || user?.accent_color })
            setInfo(t('userSettings.appearance.themeResetToast'))
          }}
        >
          {t('userSettings.appearance.resetButton')}
        </button>
      </div>
    </div>
  )
}
