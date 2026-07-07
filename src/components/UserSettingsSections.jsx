import UserSettingsLanguageSection from './userSettings/UserSettingsLanguageSection'
import UserSettingsProfileSection from './userSettings/UserSettingsProfileSection'
import UserSettingsAppearanceSection from './userSettings/UserSettingsAppearanceSection'
import UserSettingsAccountSection from './userSettings/UserSettingsAccountSection'
import UserSettingsActivitySection from './userSettings/UserSettingsActivitySection'
import UserSettingsVoiceSection from './userSettings/UserSettingsVoiceSection'

export default function UserSettingsSections(props) {
  const { activeSection } = props

  if (activeSection === 'language') {
    return <UserSettingsLanguageSection t={props.t} />
  }
  if (activeSection === 'profile') {
    return <UserSettingsProfileSection {...props} />
  }
  if (activeSection === 'appearance') {
    return <UserSettingsAppearanceSection {...props} />
  }
  if (activeSection === 'account') {
    return <UserSettingsAccountSection {...props} />
  }
  if (activeSection === 'activity') {
    return <UserSettingsActivitySection {...props} />
  }
  if (activeSection === 'voice') {
    return <UserSettingsVoiceSection {...props} />
  }
  return null
}
