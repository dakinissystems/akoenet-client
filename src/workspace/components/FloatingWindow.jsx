import { useCallback, useRef } from 'react'

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
  children,
}) {
  const dragOffset = useRef(null)

  const onPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      onFocus(id)
      dragOffset.current = { x: e.clientX - rect.x, y: e.clientY - rect.y }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [id, onFocus, rect.x, rect.y]
  )

  const onPointerMove = useCallback(
    (e) => {
      if (!dragOffset.current) return
      onMove(id, {
        ...rect,
        x: Math.max(8, e.clientX - dragOffset.current.x),
        y: Math.max(8, e.clientY - dragOffset.current.y),
      })
    },
    [id, onMove, rect]
  )

  const onPointerUp = useCallback((e) => {
    dragOffset.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="ws-float-title">{title}</span>
      </header>
      <div className="ws-float-body">{children}</div>
    </div>
  )
}
