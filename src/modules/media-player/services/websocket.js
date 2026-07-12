/**
 * WebSocket sync para salas "Listen together"
 * @param {string} roomId
 * @param {{ onState?: (state: unknown) => void }} handlers
 */
export function connectRoomSync(roomId, handlers = {}) {
  const base = import.meta.env?.VITE_MEDIA_WS_URL ?? "ws://localhost:4090/media/ws";
  const url = `${base}?room=${encodeURIComponent(roomId)}`;
  let ws = null;

  try {
    ws = new WebSocket(url);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "room:state") handlers.onState?.(msg.state);
      } catch {
        /* ignore */
      }
    };
  } catch {
    /* WS opcional en MVP */
  }

  return {
    sendState(trackId, positionMs, playing) {
      ws?.send(JSON.stringify({ type: "sync:state", trackId, positionMs, playing }));
    },
    seek(positionMs) {
      ws?.send(JSON.stringify({ type: "sync:seek", positionMs }));
    },
    close() {
      ws?.close();
    },
  };
}
