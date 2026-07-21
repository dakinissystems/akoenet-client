import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

import { getApiBaseUrl } from '../lib/apiBase'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { useServerLevelUnlocks } from '../hooks/useServerLevelUnlocks'

const baseURL = getApiBaseUrl()

export default function ServerEmojiManager({ serverId, emojis, onReload, canManage = false }) {
  const { t } = useTranslation()
  const { unlocked, unlockAt } = useServerLevelUnlocks(serverId)
  const canCreate = Boolean(canManage || unlocked.custom_emoji)
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function createEmoji(e) {
    e.preventDefault()
    if (!canCreate) return
    const file = e.target.elements.file?.files?.[0]
    if (!name.trim() || !file || !serverId) return
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const token = localStorage.getItem('token')
      const uploadRes = await fetch(`${baseURL}/upload/server/${serverId}/emoji`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'upload')
      await api.post(`/servers/${serverId}/emojis`, {
        name: name.trim().toLowerCase(),
        image_url: uploadData.url,
      })
      setName('')
      e.target.reset()
      await onReload()
    } catch (err) {
      const data = err.response?.data
      if (data?.reason === 'unlock_or_manage_required' || data?.unlock === 'custom_emoji') {
        setError(t('serverModal.emojiUnlockRequired', { level: data?.unlockAt || unlockAt.custom_emoji || 20 }))
      } else {
        setError(err.message || t('serverModal.emojiCreateFailed'))
      }
    } finally {
      setUploading(false)
    }
  }

  async function removeEmoji(emojiId) {
    if (!canManage) return
    try {
      await api.delete(`/servers/${serverId}/emojis/${emojiId}`)
      await onReload()
    } catch {
      setError(t('serverModal.emojiDeleteFailed'))
    }
  }

  return (
    <section className="perm-panel">
      <header>{t('serverModal.emojisTitle')}</header>
      {error && <div className="error-banner inline">{error}</div>}
      {canCreate ? (
        <form className="form-stack" onSubmit={createEmoji}>
          <label>
            {t('serverModal.emojiNameLabel')}
            <input
              id="server-emoji-name"
              name="emoji_name"
              placeholder={t('serverModal.emojiNamePh')}
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s+/g, '_'))}
            />
          </label>
          <label>
            {t('serverModal.emojiImageLabel')}
            <input name="file" type="file" accept="image/*" />
          </label>
          <button type="submit" className="btn secondary" disabled={uploading}>
            {uploading ? t('serverModal.emojiUploading') : t('serverModal.emojiCreate')}
          </button>
          {!canManage && unlocked.custom_emoji ? (
            <p className="muted small">{t('serverModal.emojiUnlockHint', { level: unlockAt.custom_emoji || 20 })}</p>
          ) : null}
        </form>
      ) : (
        <p className="muted small">{t('serverModal.emojiReadOnly', { level: unlockAt.custom_emoji || 20 })}</p>
      )}
      <div className="emoji-list">
        {emojis.length === 0 ? (
          <p className="muted small">{t('serverModal.emojiEmpty')}</p>
        ) : (
          emojis.map((emoji) => (
            <div key={emoji.id} className="emoji-row">
              <img src={resolveImageUrl(emoji.image_url)} alt={emoji.name} />
              <code>:{emoji.name}:</code>
              {canManage ? (
                <button type="button" className="btn small ghost" onClick={() => removeEmoji(emoji.id)}>
                  {t('serverAutomations.remove')}
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
