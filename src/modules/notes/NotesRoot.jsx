import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FloatingWindow from '../../workspace/components/FloatingWindow.jsx'
import { useDesktopLayout } from '../../workspace/desktopRuntime/useDesktopLayout.js'
import {
  applyWindowSnap,
  constrainToViewport,
} from '../../workspace/desktopRuntime/windowSnap.js'
import {
  bindNotesPersistHook,
  createNote,
  deleteNote,
  dumpNotesStore,
  hydrateNotesStore,
  listNotes,
  searchNotes,
  updateNote,
} from './notesStorage.js'
import { useAddonDataSync } from '../../workspace/useAddonDataSync.js'
import { NOTES_WINDOW_REGISTRY, notesDefaultLayout } from './windowRegistry.js'
import './notes.css'

const ADDON_ID = 'notes'

export default function NotesRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const [notes, setNotes] = useState(() => listNotes())
  const [activeId, setActiveId] = useState(() => notes[0]?.id || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: NOTES_WINDOW_REGISTRY,
    factoryLayout: notesDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('notes.editor')

  useAddonDataSync('notes', {
    hydrate: hydrateNotesStore,
    dump: dumpNotesStore,
    bindPersist: bindNotesPersistHook,
    onHydrated: () => setNotes(listNotes()),
  })

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) || null,
    [notes, activeId]
  )

  useEffect(() => {
    if (!activeNote) return
    setDraftTitle(activeNote.title)
    setDraftBody(activeNote.body)
  }, [activeNote?.id])

  useEffect(() => {
    if (!activeId && notes[0]) setActiveId(notes[0].id)
  }, [activeId, notes])

  const refreshNotes = useCallback(() => {
    setNotes(listNotes())
  }, [])

  const filteredNotes = useMemo(
    () => (searchQuery.trim() ? searchNotes(searchQuery) : notes),
    [notes, searchQuery]
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
        const snapped = applyWindowSnap(id, constrained, siblings, NOTES_WINDOW_REGISTRY, vp)
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

  const persistDraft = useCallback(() => {
    if (!activeId) return
    updateNote(activeId, { title: draftTitle, body: draftBody })
    refreshNotes()
  }, [activeId, draftTitle, draftBody, refreshNotes])

  useEffect(() => {
    if (!activeId) return undefined
    const timer = setTimeout(persistDraft, 600)
    return () => clearTimeout(timer)
  }, [activeId, draftTitle, draftBody, persistDraft])

  function handleNewNote() {
    const note = createNote({ title: t('notes.untitled'), body: '' })
    refreshNotes()
    setActiveId(note.id)
  }

  function handleDeleteNote(id) {
    deleteNote(id)
    const next = listNotes()
    refreshNotes()
    if (activeId === id) setActiveId(next[0]?.id || null)
  }

  const windowBodies = {
    'notes.list': (
      <div className="notes-list-panel">
        <div className="notes-list-actions">
          <button type="button" className="btn primary small" onClick={handleNewNote}>
            {t('notes.new')}
          </button>
        </div>
        <ul className="notes-list">
          {filteredNotes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                className={`notes-list-item${note.id === activeId ? ' is-active' : ''}`}
                onClick={() => setActiveId(note.id)}
              >
                <strong>{note.title}</strong>
                <span className="muted small">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </button>
              <button
                type="button"
                className="notes-list-delete"
                aria-label={t('notes.delete')}
                onClick={() => handleDeleteNote(note.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    ),
    'notes.editor': activeNote ? (
      <div className="notes-editor-panel">
        <input
          className="notes-title-input"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder={t('notes.titlePlaceholder')}
        />
        <textarea
          className="notes-body-input"
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          placeholder={t('notes.bodyPlaceholder')}
        />
      </div>
    ) : (
      <p className="muted">{t('notes.emptyEditor')}</p>
    ),
    'notes.search': (
      <div className="notes-search-panel">
        <input
          className="notes-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('notes.searchPlaceholder')}
        />
        <p className="muted small">
          {t('notes.searchCount', { count: filteredNotes.length })}
        </p>
      </div>
    ),
  }

  return (
    <div className="notes-desktop">
      <header className="notes-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('notes.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="notes-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = NOTES_WINDOW_REGISTRY.find((d) => d.id === w.id)
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
