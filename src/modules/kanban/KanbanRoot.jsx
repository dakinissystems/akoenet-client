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
  createBoard,
  createTask,
  deleteTask,
  dumpKanbanStore,
  getBoard,
  hydrateKanbanStore,
  bindKanbanPersistHook,
  KANBAN_COLUMNS,
  listBoards,
  tasksByColumn,
  updateTask,
} from './kanbanStorage.js'
import { useAddonDataSync } from '../../workspace/useAddonDataSync.js'
import { KANBAN_WINDOW_REGISTRY, kanbanDefaultLayout } from './windowRegistry.js'
import './kanban.css'

const ADDON_ID = 'kanban'

export default function KanbanRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const [boards, setBoards] = useState(() => listBoards())
  const [activeBoardId, setActiveBoardId] = useState(() => boards[0]?.id || null)
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftColumn, setDraftColumn] = useState('todo')

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: KANBAN_WINDOW_REGISTRY,
    factoryLayout: kanbanDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('kanban.board')

  useAddonDataSync('kanban', {
    hydrate: hydrateKanbanStore,
    dump: dumpKanbanStore,
    bindPersist: bindKanbanPersistHook,
    onHydrated: () => setBoards(listBoards()),
  })

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || null,
    [boards, activeBoardId]
  )

  const activeTask = useMemo(() => {
    if (!activeBoard || !activeTaskId) return null
    return activeBoard.tasks.find((task) => task.id === activeTaskId) || null
  }, [activeBoard, activeTaskId])

  useEffect(() => {
    if (!activeTask) return
    setDraftTitle(activeTask.title)
    setDraftDescription(activeTask.description || '')
    setDraftColumn(activeTask.column || 'todo')
  }, [activeTask?.id])

  useEffect(() => {
    if (!activeBoardId && boards[0]) setActiveBoardId(boards[0].id)
  }, [activeBoardId, boards])

  const refreshBoards = useCallback(() => {
    setBoards(listBoards())
  }, [])

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
        const snapped = applyWindowSnap(id, constrained, siblings, KANBAN_WINDOW_REGISTRY, vp)
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

  const persistTaskDraft = useCallback(() => {
    if (!activeBoardId || !activeTaskId) return
    updateTask(activeBoardId, activeTaskId, {
      title: draftTitle,
      description: draftDescription,
      column: draftColumn,
    })
    refreshBoards()
  }, [activeBoardId, activeTaskId, draftTitle, draftDescription, draftColumn, refreshBoards])

  useEffect(() => {
    if (!activeTaskId) return undefined
    const timer = setTimeout(persistTaskDraft, 600)
    return () => clearTimeout(timer)
  }, [activeTaskId, draftTitle, draftDescription, draftColumn, persistTaskDraft])

  function handleNewBoard() {
    const board = createBoard(t('kanban.untitledBoard'))
    refreshBoards()
    setActiveBoardId(board.id)
    setActiveTaskId(null)
  }

  function handleNewTask(column = 'todo') {
    if (!activeBoardId) return
    const task = createTask(activeBoardId, { title: t('kanban.untitledTask'), column })
    refreshBoards()
    setActiveTaskId(task.id)
  }

  function handleDeleteTask() {
    if (!activeBoardId || !activeTaskId) return
    deleteTask(activeBoardId, activeTaskId)
    const board = getBoard(activeBoardId)
    refreshBoards()
    setActiveTaskId(board?.tasks[0]?.id || null)
  }

  function handleMoveTask(taskId, column) {
    if (!activeBoardId) return
    updateTask(activeBoardId, taskId, { column })
    refreshBoards()
    setActiveTaskId(taskId)
  }

  const windowBodies = {
    'kanban.boards': (
      <div className="kanban-boards-panel">
        <div className="kanban-boards-actions">
          <button type="button" className="btn primary small" onClick={handleNewBoard}>
            {t('kanban.newBoard')}
          </button>
        </div>
        <ul className="kanban-boards-list">
          {boards.map((board) => (
            <li key={board.id}>
              <button
                type="button"
                className={`kanban-boards-item${board.id === activeBoardId ? ' is-active' : ''}`}
                onClick={() => {
                  setActiveBoardId(board.id)
                  setActiveTaskId(board.tasks[0]?.id || null)
                }}
              >
                <strong>{board.title}</strong>
                <span className="muted small">
                  {t('kanban.taskCount', { count: board.tasks.length })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    ),
    'kanban.board': activeBoard ? (
      <div className="kanban-board-panel">
        <div className="kanban-board-header">
          <h2 className="kanban-board-title">{activeBoard.title}</h2>
          <button type="button" className="btn ghost small" onClick={() => handleNewTask('todo')}>
            {t('kanban.newTask')}
          </button>
        </div>
        <div className="kanban-columns">
          {KANBAN_COLUMNS.map((col) => (
            <section key={col.id} className="kanban-column">
              <div className="kanban-column-head">{t(col.labelKey)}</div>
              <ul className="kanban-column-list">
                {tasksByColumn(activeBoard, col.id).map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      className={`kanban-task-card${task.id === activeTaskId ? ' is-active' : ''}`}
                      onClick={() => setActiveTaskId(task.id)}
                      onDoubleClick={() => handleMoveTask(task.id, nextColumn(col.id))}
                      title={t('kanban.moveHint')}
                    >
                      {task.title}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    ) : (
      <p className="muted">{t('kanban.emptyBoard')}</p>
    ),
    'kanban.task': activeTask ? (
      <div className="kanban-task-panel">
        <div className="kanban-field">
          <label htmlFor="kanban-title">{t('kanban.titleLabel')}</label>
          <input
            id="kanban-title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder={t('kanban.titlePlaceholder')}
          />
        </div>
        <div className="kanban-field">
          <label htmlFor="kanban-column">{t('kanban.columnLabel')}</label>
          <select
            id="kanban-column"
            value={draftColumn}
            onChange={(e) => setDraftColumn(e.target.value)}
          >
            {KANBAN_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {t(col.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="kanban-field">
          <label htmlFor="kanban-desc">{t('kanban.descriptionLabel')}</label>
          <textarea
            id="kanban-desc"
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder={t('kanban.descriptionPlaceholder')}
          />
        </div>
        <div className="kanban-task-actions">
          <button type="button" className="btn ghost small" onClick={handleDeleteTask}>
            {t('kanban.delete')}
          </button>
        </div>
      </div>
    ) : (
      <p className="muted">{t('kanban.emptyTask')}</p>
    ),
  }

  return (
    <div className="kanban-desktop">
      <header className="kanban-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('kanban.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="kanban-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = KANBAN_WINDOW_REGISTRY.find((d) => d.id === w.id)
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

function nextColumn(columnId) {
  const order = KANBAN_COLUMNS.map((c) => c.id)
  const idx = order.indexOf(columnId)
  if (idx < 0) return 'todo'
  return order[(idx + 1) % order.length]
}
