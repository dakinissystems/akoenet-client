import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useServerLevelUnlocks } from '../hooks/useServerLevelUnlocks'
import ServerCustomCommandsTab from './ServerCustomCommandsTab'
import ServerCustomEventsTab from './ServerCustomEventsTab'
import ServerCustomAnnouncementsTab from './ServerCustomAnnouncementsTab'

function fromDatetimeLocalValue(s) {
  if (!s || !String(s).trim()) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export default function ServerCustomContentSettings({ serverId, canManage, tab }) {
  const { t } = useTranslation()
  const { unlocked, unlockAt } = useServerLevelUnlocks(serverId)
  const canCreateEvents = Boolean(unlocked.create_events)
  const [commands, setCommands] = useState([])
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [textChannels, setTextChannels] = useState([])
  const [cmdName, setCmdName] = useState('')
  const [cmdResponse, setCmdResponse] = useState('')
  const [cmdActionType, setCmdActionType] = useState('none')
  const [cmdActionValue, setCmdActionValue] = useState('')
  const [evTitle, setEvTitle] = useState('')
  const [evDesc, setEvDesc] = useState('')
  const [evStart, setEvStart] = useState('')
  const [evEnd, setEvEnd] = useState('')
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [publishChannelId, setPublishChannelId] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')

  const loadAll = useCallback(async () => {
    if (!serverId) return
    setLocalError('')
    try {
      const [c, e, a, ch] = await Promise.all([
        api.get(`/servers/${serverId}/custom-commands`),
        api.get(`/servers/${serverId}/events`),
        api.get(`/servers/${serverId}/announcements`),
        api.get(`/channels/server/${serverId}`),
      ])
      setCommands(c.data || [])
      setEvents(e.data || [])
      setAnnouncements(a.data || [])
      setTextChannels((ch.data || []).filter((x) => x.type === 'text'))
    } catch {
      setLocalError(t('serverAutomations.errLoad'))
    }
  }, [serverId, t])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function addCommand(e) {
    e.preventDefault()
    if (!canManage) return
    const name = String(cmdName || '')
      .trim()
      .replace(/^!/, '')
      .toLowerCase()
    if (!name || !cmdResponse.trim()) return
    setBusy(true)
    setLocalError('')
    try {
      await api.post(`/servers/${serverId}/custom-commands`, {
        command_name: name,
        response: cmdResponse.trim(),
        action_type: cmdActionType,
        action_value: cmdActionValue.trim() || null,
      })
      setCmdName('')
      setCmdResponse('')
      setCmdActionType('none')
      setCmdActionValue('')
      await loadAll()
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'reserved_command_name') setLocalError(t('serverAutomations.errReservedName'))
      else if (code === 'command_name_taken') setLocalError(t('serverAutomations.errNameTaken'))
      else if (code === 'blocked_content') setLocalError(t('serverAutomations.errBlocked'))
      else setLocalError(t('serverAutomations.errSaveCommand'))
    } finally {
      setBusy(false)
    }
  }

  async function removeCommand(id) {
    if (!canManage || !id) return
    setBusy(true)
    setLocalError('')
    try {
      await api.delete(`/servers/${serverId}/custom-commands/${id}`)
      await loadAll()
    } catch {
      setLocalError(t('serverAutomations.errDeleteCommand'))
    } finally {
      setBusy(false)
    }
  }

  async function addEvent(e) {
    e.preventDefault()
    if (!canManage && !canCreateEvents) return
    const starts = fromDatetimeLocalValue(evStart)
    if (!starts) {
      setLocalError(t('serverAutomations.errEventStart'))
      return
    }
    let ends = fromDatetimeLocalValue(evEnd)
    if (evEnd.trim() && !ends) {
      setLocalError(t('serverAutomations.errEndInvalid'))
      return
    }
    if (ends && new Date(ends) < new Date(starts)) {
      setLocalError(t('serverAutomations.errEndBeforeStart'))
      return
    }
    setBusy(true)
    setLocalError('')
    try {
      await api.post(`/servers/${serverId}/events`, {
        title: evTitle.trim(),
        description: evDesc.trim() || null,
        starts_at: starts,
        ends_at: ends || null,
      })
      setEvTitle('')
      setEvDesc('')
      setEvStart('')
      setEvEnd('')
      await loadAll()
    } catch (err) {
      const data = err.response?.data
      if (data?.error === 'blocked_content') setLocalError(t('serverAutomations.errBlocked'))
      else if (data?.reason === 'unlock_or_manage_required' || data?.unlock === 'create_events') {
        setLocalError(t('serverAutomations.eventsReadOnly', { level: data?.unlockAt || unlockAt.create_events || 15 }))
      } else setLocalError(t('serverAutomations.errSaveEvent'))
    } finally {
      setBusy(false)
    }
  }

  async function removeEvent(id) {
    if (!canManage || !id) return
    setBusy(true)
    setLocalError('')
    try {
      await api.delete(`/servers/${serverId}/events/${id}`)
      await loadAll()
    } catch {
      setLocalError(t('serverAutomations.errDeleteEvent'))
    } finally {
      setBusy(false)
    }
  }

  async function addAnnouncement(e) {
    e.preventDefault()
    if (!canManage) return
    if (!annTitle.trim() || !annBody.trim()) return
    setBusy(true)
    setLocalError('')
    try {
      await api.post(`/servers/${serverId}/announcements`, {
        title: annTitle.trim(),
        body: annBody.trim(),
      })
      setAnnTitle('')
      setAnnBody('')
      await loadAll()
    } catch (err) {
      if (err.response?.data?.error === 'blocked_content') setLocalError(t('serverAutomations.errBlocked'))
      else setLocalError(t('serverAutomations.errSaveAnnouncement'))
    } finally {
      setBusy(false)
    }
  }

  async function removeAnnouncement(id) {
    if (!canManage || !id) return
    setBusy(true)
    setLocalError('')
    try {
      await api.delete(`/servers/${serverId}/announcements/${id}`)
      await loadAll()
    } catch {
      setLocalError(t('serverAutomations.errDeleteAnnouncement'))
    } finally {
      setBusy(false)
    }
  }

  async function publishAnnouncement(announcementId) {
    if (!canManage || !announcementId) return
    const cid = parseInt(publishChannelId, 10)
    if (Number.isNaN(cid) || cid <= 0) {
      setLocalError(t('serverAutomations.errChooseChannel'))
      return
    }
    setBusy(true)
    setLocalError('')
    try {
      await api.post(`/servers/${serverId}/announcements/${announcementId}/publish`, {
        channel_id: cid,
      })
      await loadAll()
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'send_forbidden') setLocalError(t('serverAutomations.errSendForbidden'))
      else setLocalError(t('serverAutomations.errPublish'))
    } finally {
      setBusy(false)
    }
  }

  const sid = String(serverId)
  const sectionClass = 'server-custom-section'

  return (
    <div className="server-custom-content server-custom-content--tab">
      {localError ? <div className="error-banner inline">{localError}</div> : null}

      {tab === 'commands' ? (
        <ServerCustomCommandsTab
          serverId={serverId}
          canManage={canManage}
          commands={commands}
          busy={busy}
          cmdName={cmdName}
          setCmdName={setCmdName}
          cmdResponse={cmdResponse}
          setCmdResponse={setCmdResponse}
          cmdActionType={cmdActionType}
          setCmdActionType={setCmdActionType}
          cmdActionValue={cmdActionValue}
          setCmdActionValue={setCmdActionValue}
          addCommand={addCommand}
          removeCommand={removeCommand}
          t={t}
          sectionClass={sectionClass}
          sid={sid}
        />
      ) : null}

      {tab === 'events' ? (
        <ServerCustomEventsTab
          serverId={serverId}
          canManage={canManage}
          canCreateEvents={canCreateEvents}
          unlockAt={unlockAt.create_events || 15}
          events={events}
          busy={busy}
          evTitle={evTitle}
          setEvTitle={setEvTitle}
          evDesc={evDesc}
          setEvDesc={setEvDesc}
          evStart={evStart}
          setEvStart={setEvStart}
          evEnd={evEnd}
          setEvEnd={setEvEnd}
          addEvent={addEvent}
          removeEvent={removeEvent}
          t={t}
          sectionClass={sectionClass}
          sid={sid}
        />
      ) : null}

      {tab === 'announcements' ? (
        <ServerCustomAnnouncementsTab
          serverId={serverId}
          canManage={canManage}
          announcements={announcements}
          textChannels={textChannels}
          busy={busy}
          annTitle={annTitle}
          setAnnTitle={setAnnTitle}
          annBody={annBody}
          setAnnBody={setAnnBody}
          publishChannelId={publishChannelId}
          setPublishChannelId={setPublishChannelId}
          addAnnouncement={addAnnouncement}
          removeAnnouncement={removeAnnouncement}
          publishAnnouncement={publishAnnouncement}
          t={t}
          sectionClass={sectionClass}
          sid={sid}
        />
      ) : null}
    </div>
  )
}
