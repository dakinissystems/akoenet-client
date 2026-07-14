import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FloatingWindow from '../../workspace/components/FloatingWindow.jsx'
import { useDesktopLayout } from '../../workspace/desktopRuntime/useDesktopLayout.js'
import {
  applyWindowSnap,
  constrainToViewport,
} from '../../workspace/desktopRuntime/windowSnap.js'
import { useAddonDataSync } from '../../workspace/useAddonDataSync.js'
import {
  bindCodeEditorPersistHook,
  createFile,
  deleteFile,
  dumpCodeEditorStore,
  extractOutline,
  hydrateCodeEditorStore,
  listFiles,
  scanProblems,
  updateFile,
} from './codeEditorStorage.js'
import { CODE_EDITOR_WINDOW_REGISTRY, codeEditorDefaultLayout } from './windowRegistry.js'
import './code-editor.css'

const ADDON_ID = 'code-editor'

export default function CodeEditorRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const textareaRef = useRef(null)
  const [files, setFiles] = useState(() => listFiles())
  const [activeId, setActiveId] = useState(() => files[0]?.id || null)
  const [draftContent, setDraftContent] = useState('')
  const [draftName, setDraftName] = useState('')

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: CODE_EDITOR_WINDOW_REGISTRY,
    factoryLayout: codeEditorDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('code-editor.editor')

  useAddonDataSync('code-editor', {
    hydrate: hydrateCodeEditorStore,
    dump: dumpCodeEditorStore,
    bindPersist: bindCodeEditorPersistHook,
    onHydrated: () => {
      const next = listFiles()
      setFiles(next)
      if (next[0]) setActiveId(next[0].id)
    },
  })

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeId) || null,
    [files, activeId]
  )

  const outline = useMemo(
    () => extractOutline(draftContent, activeFile?.language),
    [draftContent, activeFile?.language]
  )

  const problems = useMemo(() => scanProblems(draftContent), [draftContent])

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, draftContent.split('\n').length)
    return Array.from({ length: count }, (_, i) => i + 1)
  }, [draftContent])

  useEffect(() => {
    if (!activeFile) return
    setDraftName(activeFile.name)
    setDraftContent(activeFile.content)
  }, [activeFile?.id])

  useEffect(() => {
    if (!activeId && files[0]) setActiveId(files[0].id)
  }, [activeId, files])

  const refreshFiles = useCallback(() => {
    setFiles(listFiles())
  }, [])

  const persistDraft = useCallback(
    (content, name) => {
      if (!activeId) return
      updateFile(activeId, {
        content,
        ...(name !== undefined ? { name } : {}),
      })
      refreshFiles()
    },
    [activeId, refreshFiles]
  )

  useEffect(() => {
    if (!activeId) return undefined
    const timer = setTimeout(() => {
      persistDraft(draftContent, draftName)
    }, 500)
    return () => clearTimeout(timer)
  }, [activeId, draftContent, draftName, persistDraft])

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
        const snapped = applyWindowSnap(id, constrained, siblings, CODE_EDITOR_WINDOW_REGISTRY, vp)
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

  const handleNewFile = () => {
    const file = createFile(`snippet-${files.length + 1}.js`)
    refreshFiles()
    setActiveId(file.id)
    focus('code-editor.editor')
  }

  const handleDeleteFile = () => {
    if (!activeId) return
    deleteFile(activeId)
    const next = listFiles()
    refreshFiles()
    setActiveId(next[0]?.id || null)
  }

  const jumpToLine = (line) => {
    const ta = textareaRef.current
    if (!ta) return
    const lines = draftContent.split('\n')
    let pos = 0
    for (let i = 0; i < line - 1 && i < lines.length; i += 1) {
      pos += lines[i].length + 1
    }
    ta.focus()
    ta.setSelectionRange(pos, pos)
    focus('code-editor.editor')
  }

  const windowBodies = {
    'code-editor.explorer': (
      <div className="code-editor-panel">
        <div className="code-editor-actions">
          <button type="button" className="btn ghost small" onClick={handleNewFile}>
            {t('codeEditor.newFile')}
          </button>
          <button
            type="button"
            className="btn ghost small"
            disabled={!activeId}
            onClick={handleDeleteFile}
          >
            {t('codeEditor.deleteFile')}
          </button>
        </div>
        <ul className="code-editor-file-list">
          {files.map((file) => (
            <li key={file.id}>
              <button
                type="button"
                className={`code-editor-file-btn ${file.id === activeId ? 'code-editor-file-btn--active' : ''}`}
                onClick={() => setActiveId(file.id)}
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    ),
    'code-editor.editor': (
      <div className="code-editor-panel">
        <div className="code-editor-meta">
          <input
            className="code-editor-name-input"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            aria-label={t('codeEditor.fileName')}
          />
          <span className="muted small">{activeFile?.language || 'plaintext'}</span>
        </div>
        <div className="code-editor-editor-wrap">
          <div className="code-editor-gutter" aria-hidden="true">
            {lineNumbers.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="code-editor-textarea"
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            spellCheck={false}
            aria-label={t('codeEditor.editor')}
          />
        </div>
        <p className="muted small">{t('codeEditor.hint')}</p>
      </div>
    ),
    'code-editor.outline': (
      <div className="code-editor-panel">
        {problems.length ? (
          <>
            <p className="muted small">{t('codeEditor.problems')}</p>
            <ul className="code-editor-file-list">
              {problems.map((p, i) => (
                <li key={`p-${i}`}>
                  <button
                    type="button"
                    className={`code-editor-problem code-editor-problem--${p.severity}`}
                    onClick={() => jumpToLine(p.line)}
                  >
                    L{p.line}: {p.message}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="muted small">{t('codeEditor.outline')}</p>
        {outline.length ? (
          <ul className="code-editor-outline-list">
            {outline.map((item) => (
              <li key={`${item.line}-${item.label}`}>
                <button
                  type="button"
                  className="code-editor-outline-item"
                  onClick={() => jumpToLine(item.line)}
                >
                  {item.kind === 'class' ? '◆' : 'ƒ'} {item.label}:{item.line}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">{t('codeEditor.outlineEmpty')}</p>
        )}
      </div>
    ),
  }

  return (
    <div className="code-editor-desktop">
      <header className="code-editor-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('codeEditor.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="code-editor-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = CODE_EDITOR_WINDOW_REGISTRY.find((d) => d.id === w.id)
            return (
              <FloatingWindow
                key={w.id}
                id={w.id}
                title={desc?.title || w.title}
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
