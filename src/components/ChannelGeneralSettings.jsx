import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ChannelGeneralSettings({
  activeChannel,
  categories,
  isVoice,
  onUpdateChannel,
}) {
  const { t } = useTranslation()
  const [editName, setEditName] = useState(activeChannel?.name || '')
  const [editCategoryId, setEditCategoryId] = useState(
    activeChannel?.category_id ? String(activeChannel.category_id) : '',
  )
  const [editPrivate, setEditPrivate] = useState(Boolean(activeChannel?.is_private))
  const [editVoiceUserLimit, setEditVoiceUserLimit] = useState(
    activeChannel?.voice_user_limit != null && activeChannel?.voice_user_limit !== ''
      ? String(activeChannel.voice_user_limit)
      : '',
  )
  const [savingSettings, setSavingSettings] = useState(false)
  const voiceLimitHintId = useId()
  const cid = activeChannel?.id ?? 'none'

  return (
    <div className="channel-settings-section">
      <h4 className="channel-settings-section-title">{t('channelPerm.generalTitle')}</h4>
      <p className="channel-settings-section-desc">
        {isVoice ? t('channelPerm.generalDescVoice') : t('channelPerm.generalDescText')}
      </p>
      <div className="channel-settings-fields">
        <label className="channel-settings-field">
          <span className="channel-settings-label">{t('channelPerm.name')}</span>
          <input
            id={`ch-settings-name-${cid}`}
            name="channel_name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="channel-settings-field">
          <span className="channel-settings-label">{t('channelPerm.category')}</span>
          <select
            id={`ch-settings-category-${cid}`}
            name="channel_category_id"
            className="select-inline"
            value={editCategoryId}
            onChange={(e) => setEditCategoryId(e.target.value)}
          >
            <option value="">{t('channelPerm.uncategorized')}</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="channel-settings-field channel-settings-field--inline">
          <input
            id={`ch-settings-private-${cid}`}
            name="channel_is_private"
            type="checkbox"
            checked={editPrivate}
            onChange={(e) => setEditPrivate(e.target.checked)}
          />
          <span>
            <strong>{t('channelPerm.privateStrong')}</strong>
            <span className="channel-settings-inline-hint">{t('channelPerm.privateHint')}</span>
          </span>
        </label>
        {isVoice && (
          <label className="channel-settings-field">
            <span className="channel-settings-label">{t('channelPerm.maxVoiceUsers')}</span>
            <div className="channel-settings-voice-limit-row">
              <input
                id={`ch-settings-voice-limit-${cid}`}
                name="voice_user_limit"
                type="number"
                min={1}
                max={99}
                placeholder={t('channelPerm.noLimitPlaceholder')}
                aria-describedby={voiceLimitHintId}
                value={editVoiceUserLimit}
                onChange={(e) => setEditVoiceUserLimit(e.target.value.replace(/[^\d]/g, ''))}
              />
              <span className="channel-settings-voice-limit-suffix" aria-hidden>
                {t('channelPerm.usersSuffix')}
              </span>
            </div>
            <p id={voiceLimitHintId} className="channel-settings-hint">
              {t('channelPerm.voiceLimitHint')}
            </p>
          </label>
        )}
        <div className="channel-settings-actions">
          <button
            type="button"
            className="btn primary"
            disabled={savingSettings || !activeChannel?.id || !editName.trim()}
            onClick={async () => {
              if (!activeChannel?.id) return
              setSavingSettings(true)
              try {
                const payload = {
                  name: editName.trim(),
                  category_id: editCategoryId ? Number(editCategoryId) : null,
                  is_private: editPrivate,
                }
                if (isVoice) {
                  const trimmedLimit = editVoiceUserLimit.trim()
                  payload.voice_user_limit = trimmedLimit === '' ? null : Number(trimmedLimit)
                }
                await onUpdateChannel?.(activeChannel.id, payload)
              } finally {
                setSavingSettings(false)
              }
            }}
          >
            {savingSettings ? t('channelPerm.saving') : t('channelPerm.saveChannel')}
          </button>
        </div>
      </div>
    </div>
  )
}
