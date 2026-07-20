import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

/**
 * Panel de gamificación — requiere módulo Assistant «levels» activo.
 */
export default function ServerLevelsPanel({ serverId, t }) {
  const [state, setState] = useState({ loading: true, enabled: false, rank: null, quests: [], board: [] })
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!serverId) return
    setError('')
    try {
      const [me, board] = await Promise.all([
        api.get(`/servers/${serverId}/levels/me`),
        api.get(`/servers/${serverId}/levels/leaderboard`, { params: { limit: 15 } }),
      ])
      setState({
        loading: false,
        enabled: Boolean(me.data?.enabled),
        rank: me.data?.rank || null,
        quests: me.data?.quests || [],
        board: board.data?.items || [],
      })
    } catch (e) {
      setState((s) => ({ ...s, loading: false }))
      setError(e?.response?.data?.error || t('levels.errLoad'))
    }
  }, [serverId, t])

  useEffect(() => {
    load()
  }, [load])

  const claim = async () => {
    setBusy(true)
    setInfo('')
    setError('')
    try {
      const { data } = await api.post(`/servers/${serverId}/levels/quests/claim`)
      if (data.claimed) {
        setInfo(t('levels.claimOk'))
        await load()
      } else {
        setInfo(t('levels.claimIncomplete'))
      }
    } catch (e) {
      setError(e?.response?.data?.error || t('levels.errClaim'))
    } finally {
      setBusy(false)
    }
  }

  if (state.loading) {
    return <p className="muted small">{t('levels.loading')}</p>
  }

  if (!state.enabled) {
    return (
      <div className="info-banner">
        {t('levels.disabledHint')}
      </div>
    )
  }

  const rank = state.rank

  return (
    <div className="server-levels-panel">
      {error ? <div className="error-banner inline">{error}</div> : null}
      {info ? <div className="info-banner">{info}</div> : null}

      {rank ? (
        <section className="server-levels-card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 0.35rem' }}>
            {t('levels.yourRank')} · Lv {rank.level}
          </h3>
          <p className="muted small" style={{ margin: 0 }}>
            {rank.xpTotal.toLocaleString()} XP · #{rank.rank} · {rank.coins} AK · ★ {rank.reputationScore}
          </p>
          <div
            className="server-levels-bar"
            style={{
              marginTop: '0.5rem',
              height: 8,
              borderRadius: 4,
              background: 'rgba(127,127,127,0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (rank.xpIntoLevel / Math.max(1, rank.xpIntoLevel + rank.xpToNextLevel)) * 100)}%`,
                background: 'var(--accent, #5b8def)',
              }}
            />
          </div>
          <p className="muted small" style={{ margin: '0.35rem 0 0' }}>
            {rank.xpToNextLevel} XP → Lv {rank.level + 1}
          </p>
          {rank.unlocks?.length ? (
            <p className="muted small" style={{ margin: '0.5rem 0 0' }}>
              {t('levels.unlocks')}: {rank.unlocks.map((u) => u.key).join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}

      <section style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>{t('levels.questsTitle')}</h3>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {state.quests.map((q) => (
            <li key={q.key} className="muted small">
              {q.completed ? '✔' : '○'} {q.label || q.key} ({q.progress}/{q.target})
              {q.claimed ? ` · ${t('levels.claimed')}` : null}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '0.5rem' }}
          disabled={busy}
          onClick={claim}
        >
          {t('levels.claimDaily')}
        </button>
      </section>

      <section>
        <h3 style={{ margin: '0 0 0.5rem' }}>{t('levels.leaderboard')}</h3>
        <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
          {state.board.map((row) => (
            <li key={row.userId} className="muted small">
              <strong>{row.username}</strong> — Lv {row.level} · {row.xpTotal.toLocaleString()} XP
              {row.reputationScore ? ` · ★${row.reputationScore}` : ''}
            </li>
          ))}
        </ol>
        {!state.board.length ? <p className="muted small">{t('levels.emptyBoard')}</p> : null}
      </section>
    </div>
  )
}
