import LanguageSwitcher from '../LanguageSwitcher'

export default function UserSettingsLanguageSection({ t }) {
  return (
    <div className="form-stack">
      <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{t('userSettings.languageTitle')}</h4>
      <p className="muted small">{t('userSettings.languageHint')}</p>
      <LanguageSwitcher />
    </div>
  )
}
