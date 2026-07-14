import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FloatingWindow from '../../workspace/components/FloatingWindow.jsx'
import { useDesktopLayout } from '../../workspace/desktopRuntime/useDesktopLayout.js'
import {
  applyWindowSnap,
  constrainToViewport,
} from '../../workspace/desktopRuntime/windowSnap.js'
import {
  appendOutput,
  listBookmarks,
  listOutput,
  runTerminalCommand,
} from './terminalStorage.js'
import { TERMINAL_WINDOW_REGISTRY, terminalDefaultLayout } from './windowRegistry.js'
import './terminal.css'

const ADDON_ID = 'terminal'

export default function TerminalRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const inputRef = useRef(null)
  const logsEndRef = useRef(null)
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState(() => listOutput())
  const [bookmarks, setBookmarks] = useState(() => listBookmarks())

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: TERMINAL_WINDOW_REGISTRY,
    factoryLayout: terminalDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('terminal.shell')

  const refreshLogs = useCallback(() => {
    setLogs(listOutput())
    setBookmarks(listBookmarks())
  }, [])

  useEffect(() => {
    if (!listOutput().length) {
      appendOutput(t('terminal.welcome'), 'stdout')
      refreshLogs()
    }
  }, [refreshLogs, t])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const execute = useCallback(
    (command) => {
      const cmd = String(command || '').trim()
      if (!cmd) return

      appendOutput(`$ ${cmd}`, 'cmd')
      const result = runTerminalCommand(cmd, { navigate, t })

      if (result.cleared) {
        refreshLogs()
        return
      }

      for (const line of result.lines || []) {
        appendOutput(line, 'stdout')
      }

      if (result.external) {
        window.open(result.external, '_blank', 'noopener,noreferrer')
      } else if (result.navigateTo) {
        navigate(result.navigateTo)
      }

      refreshLogs()
    },
    [navigate, refreshLogs, t]
  )

  const getViewport = useCallback(() => {
    const el = desktopRef.current
    if (!el) return { width: 960, height: 680, topBar: 0, bottom: 0 }
    return { width: el.clientWidth, height: el.clientHeight, topBar: 0, bottom: 0 }
  }, [])

  const focus = useCallback(
    (id) => {
      setFocusedId(id)
      setWindows((prev) => {
        const maxZ = Math.max(...prev.map((w) => w.zIndex), 0)
        return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w))
      })
      if (id === 'terminal.shell') {
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    },
    [setWindows]
  )

  const moveWindow = useCallback(
    (id, rect) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)))
    },
    [setWindows]
  )

  const finishMove = useCallback(
    (id, rect) => {
      setWindows((prev) => {
        const vp = getViewport()
        const constrained = constrainToViewport(rect, vp)
        const siblings = prev.map((w) => (w.id === id ? { ...w, rect: constrained } : w))
        const snapped = applyWindowSnap(id, constrained, siblings, TERMINAL_WINDOW_REGISTRY, vp)
        return prev.map((w) => (w.id === id ? { ...w, rect: snapped } : w))
      })
    },
    [getViewport, setWindows]
  )

  const resizeWindow = useCallback(
    (id, rect) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)))
    },
    [setWindows]
  )

  const finishResize = useCallback(
    (id, rect) => {
      setWindows((prev) => {
        const vp = getViewport()
        const next = constrainToViewport(rect, vp)
        return prev.map((w) => (w.id === id ? { ...w, rect: next } : w))
      })
    },
    [getViewport, setWindows]
  )

  function handleSubmit(e) {
    e.preventDefault()
    execute(input)
    setInput('')
  }

  const windowBodies = {
    'terminal.shell': (
      <div className="terminal-shell-panel">
        <p className="muted terminal-hint">{t('terminal.hint')}</p>
        <form className="terminal-prompt-row" onSubmit={handleSubmit}>
          <span className="terminal-prompt">dakinis&gt;</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('terminal.placeholder')}
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    ),
    'terminal.logs': (
      <div className="terminal-logs-panel">
        <ul className="terminal-logs-scroll">
          {logs.map((entry, i) => (
            <li
              key={`${entry.at}-${i}`}
              className={`terminal-log-line terminal-log-line--${entry.type || 'stdout'}`}
            >
              {entry.line}
            </li>
          ))}
          <li ref={logsEndRef} />
        </ul>
      </div>
    ),
    'terminal.bookmarks': (
      <div className="terminal-bookmarks-panel">
        <p className="muted small">{t('terminal.bookmarksLead')}</p>
        <ul className="terminal-bookmarks-list">
          {bookmarks.map((bm) => (
            <li key={bm.id}>
              <button type="button" className="terminal-bookmark-btn" onClick={() => execute(bm.command)}>
                <strong>{bm.label}</strong>
                <span>{bm.command}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    ),
  }

  return (
    <div className="terminal-desktop">
      <header className="terminal-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('terminal.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="terminal-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = TERMINAL_WINDOW_REGISTRY.find((d) => d.id === w.id)
            return (
              <FloatingWindow
                key={w.id}
                id={w.id}
                title={desc?.title || w.id}
                rect={w.rect}
                zIndex={w.zIndex}
                visible={w.visible}
                minimized={w.minimized}
                focused={focusedId === w.id}
                onFocus={focus}
                onMove={moveWindow}
                onMoveEnd={finishMove}
                onResize={resizeWindow}
                onResizeEnd={finishResize}
              >
                {windowBodies[w.id]}
              </FloatingWindow>
            )
          })}
      </div>
    </div>
  )
}
