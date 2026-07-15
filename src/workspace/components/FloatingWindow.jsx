import { useCallback, useRef } from 'react'
import { clampRect } from '../desktopRuntime/windowSnap.js'

const RESIZE_HANDLES = ['e', 's', 'se']

/**
 * Ventana flotante con drag, resize y snap al soltar.
 */
export default function FloatingWindow({
  id,
  title,
  rect,
  zIndex,
  visible,
  minimized,
  focused,
  onFocus,
  onMove,
  onMoveEnd,
  onResize,
  onResizeEnd,
  onMinimize,
  onClose,
  resizable = true,
  minTop = 8,
  children,
}) {
  const dragRef = useRef(null)
  const resizeRef = useRef(null)

  const onTitleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      onFocus(id)
      const startX = e.clientX
      const startY = e.clientY
      const origin = { ...rect }
      dragRef.current = { startX, startY, origin }

      const onMoveEvt = (ev) => {
        if (!dragRef.current) return
        const dx = ev.clientX - dragRef.current.startX
        const dy = ev.clientY - dragRef.current.startY
        onMove(id, clampRect({
          ...dragRef.current.origin,
          x: Math.max(8, dragRef.current.origin.x + dx),
          y: Math.max(minTop, dragRef.current.origin.y + dy),
        }))
      }

      const onUp = (ev) => {
        if (dragRef.current) {
          const dx = ev.clientX - dragRef.current.startX
          const dy = ev.clientY - dragRef.current.startY
          const next = clampRect({
            ...dragRef.current.origin,
            x: Math.max(8, dragRef.current.origin.x + dx),
            y: Math.max(minTop, dragRef.current.origin.y + dy),
          })
          onMoveEnd?.(id, next)
        }
        dragRef.current = null
        window.removeEventListener('mousemove', onMoveEvt)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMoveEvt)
      window.addEventListener('mouseup', onUp)
    },
    [id, minTop, onFocus, onMove, onMoveEnd, rect]
  )

  const onResizeMouseDown = useCallback(
    (e, axis) => {
      if (e.button !== 0 || !resizable) return
      e.preventDefault()
      e.stopPropagation()
      onFocus(id)
      const startX = e.clientX
      const startY = e.clientY
      const origin = { ...rect }
      resizeRef.current = { startX, startY, origin, axis }

      const onMoveEvt = (ev) => {
        if (!resizeRef.current) return
        const dx = ev.clientX - resizeRef.current.startX
        const dy = ev.clientY - resizeRef.current.startY
        const { origin: o, axis: ax } = resizeRef.current
        let next = { ...o }
        if (ax.includes('e')) next.width = o.width + dx
        if (ax.includes('s')) next.height = o.height + dy
        onResize?.(id, clampRect(next))
      }

      const onUp = (ev) => {
        if (resizeRef.current) {
          const dx = ev.clientX - resizeRef.current.startX
          const dy = ev.clientY - resizeRef.current.startY
          const { origin: o, axis: ax } = resizeRef.current
          let next = { ...o }
          if (ax.includes('e')) next.width = o.width + dx
          if (ax.includes('s')) next.height = o.height + dy
          onResizeEnd?.(id, clampRect(next))
        }
        resizeRef.current = null
        window.removeEventListener('mousemove', onMoveEvt)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMoveEvt)
      window.addEventListener('mouseup', onUp)
    },
    [id, onFocus, onResize, onResizeEnd, rect, resizable]
  )

  const onTitleDoubleClick = useCallback(
    (e) => {
      if (!onMoveEnd) return
      e.preventDefault()
      onMoveEnd(id, { ...rect, y: 0 })
    },
    [id, onMoveEnd, rect]
  )

  if (!visible || minimized) return null

  return (
    <div
      className={`ws-float ${focused ? 'ws-float--focused' : ''}`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex,
      }}
      onMouseDown={() => onFocus(id)}
    >
      <header
        className="ws-float-header"
        onMouseDown={onTitleMouseDown}
        onDoubleClick={onTitleDoubleClick}
      >
        <span className="ws-float-title">{title}</span>
        {onMinimize || onClose ? (
          <div className="ws-float-chrome">
            {onMinimize ? (
              <button
                type="button"
                className="ws-float-btn ws-float-btn--minimize"
                aria-label="Minimize"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onMinimize(id)
                }}
              >
                −
              </button>
            ) : null}
            {onClose ? (
              <button
                type="button"
                className="ws-float-btn ws-float-btn--close"
                aria-label="Close"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(id)
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        ) : null}
      </header>
      <div className="ws-float-body">{children}</div>
      {resizable && onResize
        ? RESIZE_HANDLES.map((axis) => (
            <div
              key={axis}
              className={`ws-float-resize ws-float-resize--${axis}`}
              onMouseDown={(e) => onResizeMouseDown(e, axis)}
              aria-hidden
            />
          ))
        : null}
    </div>
  )
}
