import { io } from 'socket.io-client'
import { getSocketIoEndpoint } from '../lib/apiBase'
import { getAccessToken, setAccessToken } from './session-store'

let socket = null

export function connectAkoeNet(token) {
  if (socket?.connected) {
    socket.disconnect()
  }
  if (typeof token === 'string' && token) {
    setAccessToken(token)
  }
  const { url, path } = getSocketIoEndpoint()
  socket = io(url, {
    path,
    auth: (cb) => {
      cb({ token: getAccessToken() || '' })
    },
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  })
  return socket
}

export function getSocket() {
  return socket
}

/** Espera a que Socket.IO esté conectado (p. ej. tras login o wake del backend). */
export function whenSocketReady(timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const s = socket
    if (!s) {
      reject(new Error('no_socket'))
      return
    }
    if (s.connected) {
      resolve(s)
      return
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('socket_timeout'))
    }, timeoutMs)
    function onConnect() {
      cleanup()
      resolve(s)
    }
    function onError(err) {
      cleanup()
      reject(err instanceof Error ? err : new Error('connect_error'))
    }
    function cleanup() {
      clearTimeout(timer)
      s.off('connect', onConnect)
      s.off('connect_error', onError)
    }
    s.on('connect', onConnect)
    s.on('connect_error', onError)
    if (!s.active) {
      s.connect()
    }
  })
}

export function disconnectAkoeNet() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
