import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAuthLogout } from '../hooks/useAuthLogout'
import { useDismissiblePopover } from '../hooks/useDismissiblePopover'
import { inviteLandingPath, parseInviteTokenFromInput } from '../lib/invites'
import ServerSidebar from '../components/ServerSidebar'
import UserSettingsModal from '../components/UserSettingsModal'
import AppChrome from '../components/AppChrome'
import WelcomeOnboardingModal from '../components/WelcomeOnboardingModal'
import DashboardHomeHeader from '../components/DashboardHomeHeader'
import DashboardJoinSection, { DashboardServerListSection } from '../components/DashboardJoinSection'
import { hasSeenOnboarding } from '../lib/onboarding'
import DashboardAdmin from './DashboardAdmin'

const PENDING_INVITE_KEY = 'akoenet_pending_invite'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { signOut } = useAuthLogout()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [servers, setServers] = useState([])
  const [newName, setNewName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [joinLink, setJoinLink] = useState('')
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [userSettingsOpen, setUserSettingsOpen] = useState(false)
  const [creatingServer, setCreatingServer] = useState(false)
  const [joiningById, setJoiningById] = useState(false)
  const [joiningByLinkState, setJoiningByLinkState] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userAvatarFailed, setUserAvatarFailed] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(() => !hasSeenOnboarding())
  const closeUserMenu = useCallback(() => setUserMenuOpen(false), [])
  const userMenuRef = useDismissiblePopover(userMenuOpen, closeUserMenu)
  const avatarInitial = String(user?.username || 'U').trim().charAt(0).toUpperCase() || 'U'

  useEffect(() => {
    setUserAvatarFailed(false)
  }, [user?.avatar_url])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/servers')
      setServers(data)
    } catch {
      setError('Could not load servers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const steamLinked = searchParams.get('steam_linked')
    const steamErr = searchParams.get('steam_error')
    const twitchLinked = searchParams.get('twitch_linked')
    const twitchErr = searchParams.get('twitch_error')
    if (!steamLinked && !steamErr && !twitchLinked && !twitchErr) return
    let message = ''
    if (steamLinked) {
      message = t('dashboard.steamLinked')
      refreshUser().catch(() => {})
    } else if (steamErr) {
      message = t('dashboard.steamError', { code: steamErr })
    } else if (twitchLinked) {
      message = t('dashboard.twitchLinked')
      refreshUser().catch(() => {})
    } else if (twitchErr) {
      message = t('dashboard.twitchError', { code: twitchErr })
    }
    if (message) setActionMessage(message)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams, refreshUser, t])

  useEffect(() => {
    if (!user || authLoading) return
    let token
    try {
      token = sessionStorage.getItem(PENDING_INVITE_KEY)
    } catch {
      return
    }
    if (!token) return
    try {
      sessionStorage.removeItem(PENDING_INVITE_KEY)
    } catch {
      /* ignore */
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.post(`/servers/invite/${encodeURIComponent(token)}/join`)
        if (!cancelled && data?.server_id != null) {
          navigate(`/server/${data.server_id}`, { replace: true })
        }
      } catch {
        if (!cancelled) navigate(inviteLandingPath(token), { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, navigate])

  async function createServer(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setError('')
    setActionMessage('')
    setCreatingServer(true)
    try {
      await api.post('/servers', { name: newName.trim() })
      setNewName('')
      await load()
      setActionMessage('Server created successfully.')
    } catch {
      setError('Could not create server')
    } finally {
      setCreatingServer(false)
    }
  }

  async function joinServer(e) {
    e.preventDefault()
    const id = parseInt(joinId, 10)
    if (Number.isNaN(id)) {
      setError('Invalid server ID')
      return
    }
    setError('')
    setActionMessage('')
    setJoiningById(true)
    try {
      await api.post(`/servers/${id}/join`)
      setJoinId('')
      await load()
      setActionMessage('You joined the server successfully.')
    } catch (err) {
      const msg =
        err.response?.status === 409
          ? 'You are already a member'
          : err.response?.status === 404
            ? 'Server not found'
            : err.response?.status === 403
              ? 'You cannot join that server'
              : 'Could not join server'
      setError(msg)
    } finally {
      setJoiningById(false)
    }
  }

  async function joinByLink(e) {
    e.preventDefault()
    const token = parseInviteTokenFromInput(joinLink)
    if (!token) {
      setError('Invalid invite link')
      return
    }
    setError('')
    setActionMessage('')
    setJoiningByLinkState(true)
    try {
      await api.post(`/servers/invite/${token}/join`)
      setJoinLink('')
      await load()
      setActionMessage('Invite accepted. You joined the server.')
    } catch (err) {
      const msg =
        err.response?.status === 409
          ? 'You are already a member'
          : err.response?.status === 404
            ? 'Invite not found'
            : err.response?.status === 410
              ? 'Invite expired or out of uses'
              : 'Could not join with invite'
      setError(msg)
    } finally {
      setJoiningByLinkState(false)
    }
  }

  return (
    <AppChrome>
      <div className="app-shell dashboard-shell">
        <ServerSidebar
          servers={servers}
          activeServerId={null}
          onSelectServer={(id) => navigate(`/server/${id}`)}
          homeAction={() => navigate('/')}
          messagesAction={() => navigate('/messages')}
        />
        <div className="main-panel home-panel">
          <DashboardHomeHeader
            user={user}
            userAvatarFailed={userAvatarFailed}
            setUserAvatarFailed={setUserAvatarFailed}
            avatarInitial={avatarInitial}
            userMenuOpen={userMenuOpen}
            setUserMenuOpen={setUserMenuOpen}
            userMenuRef={userMenuRef}
            closeUserMenu={closeUserMenu}
            setUserSettingsOpen={setUserSettingsOpen}
            navigate={navigate}
            signOut={signOut}
            t={t}
          />

          {error && <div className="error-banner inline">{error}</div>}
          {actionMessage && <div className="info-banner" style={{ marginBottom: '0.85rem' }}>{actionMessage}</div>}

          <section className="card scheduler-spotlight" aria-labelledby="scheduler-spotlight-title">
            <h2 id="scheduler-spotlight-title">{t('dashboard.home.schedulerTitle')}</h2>
            <p className="muted small">{t('dashboard.home.schedulerBody')}</p>
          </section>

          <DashboardJoinSection
            newName={newName}
            setNewName={setNewName}
            joinLink={joinLink}
            setJoinLink={setJoinLink}
            joinId={joinId}
            setJoinId={setJoinId}
            creatingServer={creatingServer}
            joiningByLinkState={joiningByLinkState}
            joiningById={joiningById}
            createServer={createServer}
            joinByLink={joinByLink}
            joinServer={joinServer}
            t={t}
          />

          <DashboardServerListSection loading={loading} servers={servers} navigate={navigate} t={t} />

          {user?.is_admin ? <DashboardAdmin embedded /> : null}
        </div>
        <UserSettingsModal open={userSettingsOpen} onClose={() => setUserSettingsOpen(false)} />
        <WelcomeOnboardingModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      </div>
    </AppChrome>
  )
}
