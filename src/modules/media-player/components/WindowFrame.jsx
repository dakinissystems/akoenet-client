import { useCallback, useRef } from "react";

export function WindowFrame({ id, title, rect, zIndex, focused, onFocus, onMove, onClose, children }) {
  const dragRef = useRef(null);

  const onMouseDown = useCallback(
    (e) => {
      if (e.target.closest(".dmp-window__close")) return;
      onFocus();
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = { ...rect };
      dragRef.current = { startX, startY, origin };

      const onMoveEvt = (ev) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        onMove({
          ...dragRef.current.origin,
          x: Math.max(0, dragRef.current.origin.x + dx),
          y: Math.max(0, dragRef.current.origin.y + dy),
        });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMoveEvt);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMoveEvt);
      window.addEventListener("mouseup", onUp);
    },
    [onFocus, onMove, rect],
  );

  return (
    <div
      className={`dmp-window${focused ? " is-focused" : ""}`}
      data-window-id={id}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex,
      }}
    >
      <div className="dmp-window__titlebar" onMouseDown={onMouseDown}>
        <span>{title}</span>
        <button type="button" className="dmp-window__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="dmp-window__body">{children}</div>
    </div>
  );
}
