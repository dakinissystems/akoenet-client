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
  bindCalendarPersistHook,
  createEvent,
  deleteEvent,
  dumpCalendarStore,
  eventsForDay,
  hydrateCalendarStore,
  listEvents,
  toDateInputValue,
  updateEvent,
  weekDays,
} from './calendarStorage.js'
import { useAddonDataSync } from '../../workspace/useAddonDataSync.js'
import { CALENDAR_WINDOW_REGISTRY, calendarDefaultLayout } from './windowRegistry.js'
import './calendar.css'

const ADDON_ID = 'calendar'

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatEventTime(evt, locale) {
  if (evt.allDay) return '—'
  try {
    return new Date(evt.startAt).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function CalendarRoot() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-ES'
  const desktopRef = useRef(null)
  const [events, setEvents] = useState(() => listEvents())
  const [activeId, setActiveId] = useState(() => events[0]?.id || null)
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [draftTitle, setDraftTitle] = useState('')
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [draftAllDay, setDraftAllDay] = useState(false)
  const [draftDescription, setDraftDescription] = useState('')

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: CALENDAR_WINDOW_REGISTRY,
    factoryLayout: calendarDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('calendar.agenda')

  useAddonDataSync('calendar', {
    hydrate: hydrateCalendarStore,
    dump: dumpCalendarStore,
    bindPersist: bindCalendarPersistHook,
    onHydrated: () => setEvents(listEvents()),
  })

  const activeEvent = useMemo(
    () => events.find((e) => e.id === activeId) || null,
    [events, activeId]
  )

  const todayEvents = useMemo(() => eventsForDay(new Date()), [events])
  const week = useMemo(() => weekDays(anchorDate), [anchorDate])

  useEffect(() => {
    if (!activeEvent) return
    setDraftTitle(activeEvent.title)
    setDraftStart(toDateInputValue(activeEvent.startAt))
    setDraftEnd(toDateInputValue(activeEvent.endAt))
    setDraftAllDay(activeEvent.allDay)
    setDraftDescription(activeEvent.description || '')
  }, [activeEvent?.id])

  useEffect(() => {
    if (!activeId && events[0]) setActiveId(events[0].id)
  }, [activeId, events])

  const refreshEvents = useCallback(() => {
    setEvents(listEvents())
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
        const snapped = applyWindowSnap(id, constrained, siblings, CALENDAR_WINDOW_REGISTRY, vp)
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
    updateEvent(activeId, {
      title: draftTitle,
      startAt: draftStart,
      endAt: draftEnd,
      allDay: draftAllDay,
      description: draftDescription,
    })
    refreshEvents()
  }, [activeId, draftTitle, draftStart, draftEnd, draftAllDay, draftDescription, refreshEvents])

  useEffect(() => {
    if (!activeId) return undefined
    const timer = setTimeout(persistDraft, 600)
    return () => clearTimeout(timer)
  }, [activeId, draftTitle, draftStart, draftEnd, draftAllDay, draftDescription, persistDraft])

  function handleNewEvent() {
    const start = new Date()
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() + 1)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    const event = createEvent({
      title: t('calendar.untitled'),
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    })
    refreshEvents()
    setActiveId(event.id)
  }

  function handleDeleteEvent(id) {
    deleteEvent(id)
    const next = listEvents()
    refreshEvents()
    if (activeId === id) setActiveId(next[0]?.id || null)
  }

  function shiftWeek(delta) {
    setAnchorDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  const windowBodies = {
    'calendar.agenda': (
      <div className="calendar-agenda-panel">
        <div className="calendar-agenda-actions">
          <strong>{t('calendar.today')}</strong>
          <button type="button" className="btn primary small" onClick={handleNewEvent}>
            {t('calendar.new')}
          </button>
        </div>
        <ul className="calendar-agenda-list">
          {todayEvents.length ? (
            todayEvents.map((evt) => (
              <li key={evt.id}>
                <button
                  type="button"
                  className={`calendar-agenda-item${evt.id === activeId ? ' is-active' : ''}`}
                  onClick={() => setActiveId(evt.id)}
                >
                  <strong>{evt.title}</strong>
                  <span className="muted small">{formatEventTime(evt, locale)}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="muted small">{t('calendar.emptyToday')}</li>
          )}
        </ul>
      </div>
    ),
    'calendar.week': (
      <div className="calendar-week-panel">
        <div className="calendar-agenda-actions">
          <button type="button" className="btn ghost small" onClick={() => shiftWeek(-1)}>
            ←
          </button>
          <span className="small">{t('calendar.weekOf', { date: anchorDate.toLocaleDateString(locale) })}</span>
          <button type="button" className="btn ghost small" onClick={() => shiftWeek(1)}>
            →
          </button>
        </div>
        <div className="calendar-week-grid">
          {week.map((day) => {
            const dayEvents = eventsForDay(day)
            const today = isSameDay(day, new Date())
            return (
              <div key={day.toISOString()} className={`calendar-week-day${today ? ' is-today' : ''}`}>
                <div className="calendar-week-day-head">
                  {day.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
                </div>
                <ul className="calendar-week-day-events">
                  {dayEvents.map((evt) => (
                    <li key={evt.id}>
                      <button
                        type="button"
                        className={`calendar-week-chip${evt.id === activeId ? ' is-active' : ''}`}
                        onClick={() => setActiveId(evt.id)}
                        title={evt.title}
                      >
                        {formatEventTime(evt, locale)} {evt.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    ),
    'calendar.detail': activeEvent ? (
      <div className="calendar-detail-panel">
        <div className="calendar-field">
          <label htmlFor="cal-title">{t('calendar.titleLabel')}</label>
          <input
            id="cal-title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder={t('calendar.titlePlaceholder')}
          />
        </div>
        <div className="calendar-field">
          <label htmlFor="cal-start">{t('calendar.startLabel')}</label>
          <input
            id="cal-start"
            type="datetime-local"
            value={draftStart}
            onChange={(e) => setDraftStart(e.target.value)}
          />
        </div>
        <div className="calendar-field">
          <label htmlFor="cal-end">{t('calendar.endLabel')}</label>
          <input
            id="cal-end"
            type="datetime-local"
            value={draftEnd}
            onChange={(e) => setDraftEnd(e.target.value)}
          />
        </div>
        <label className="small">
          <input
            type="checkbox"
            checked={draftAllDay}
            onChange={(e) => setDraftAllDay(e.target.checked)}
          />{' '}
          {t('calendar.allDay')}
        </label>
        <div className="calendar-field">
          <label htmlFor="cal-desc">{t('calendar.descriptionLabel')}</label>
          <textarea
            id="cal-desc"
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder={t('calendar.descriptionPlaceholder')}
          />
        </div>
        <div className="calendar-detail-actions">
          <button
            type="button"
            className="btn ghost small"
            onClick={() => handleDeleteEvent(activeEvent.id)}
          >
            {t('calendar.delete')}
          </button>
        </div>
      </div>
    ) : (
      <p className="muted">{t('calendar.emptyDetail')}</p>
    ),
  }

  return (
    <div className="calendar-desktop">
      <header className="calendar-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('calendar.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="calendar-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = CALENDAR_WINDOW_REGISTRY.find((d) => d.id === w.id)
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
