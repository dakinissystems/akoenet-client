/**
 * Tab-scoped playback session — survives leaving `/media` so audio keeps playing.
 * The AudioEngine singleton owns the BufferSource; this holds track UI state + next-track policy.
 */
import { getAudioEngine } from "./audioEngine.js";

/** @typedef {{ id: string; title?: string; artist?: string; sourceRef?: string; durationMs?: number }} SessionTrack */

/** @type {{
 *   track: SessionTrack | null;
 *   buffer: AudioBuffer | null;
 *   isPlaying: boolean;
 *   volume: number;
 *   tracks: SessionTrack[];
 *   shuffle: boolean;
 *   repeat: 'off' | 'one' | 'all';
 * }} */
let session = {
  track: null,
  buffer: null,
  isPlaying: false,
  volume: 0.85,
  tracks: [],
  shuffle: false,
  repeat: "off",
};

/** @type {Set<() => void>} */
const listeners = new Set();

function emit() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      /* ignore subscriber errors */
    }
  }
}

export function getPlaybackSession() {
  return session;
}

export function subscribePlaybackSession(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function patchPlaybackSession(partial) {
  session = { ...session, ...partial };
  emit();
}

function pickNextTrack(tracks, current, { shuffle, repeat }) {
  if (!tracks.length) return null;
  if (repeat === "one" && current) return current;
  if (shuffle) {
    const pool = tracks.filter((t) => t.id !== current?.id);
    const list = pool.length ? pool : tracks;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (!current) return tracks[0];
  const idx = tracks.findIndex((t) => t.id === current.id);
  if (idx < 0) return tracks[0];
  if (idx + 1 < tracks.length) return tracks[idx + 1];
  return repeat === "all" ? tracks[0] : null;
}

let engineHooksInstalled = false;

/** Wire engine.end → auto-advance even when `/media` is unmounted. */
export function ensurePlaybackSessionEngineHooks() {
  if (engineHooksInstalled) return;
  engineHooksInstalled = true;
  const engine = getAudioEngine();
  engine.onEnded = () => {
    const next = pickNextTrack(session.tracks, session.track, session);
    if (!next?.sourceRef) {
      patchPlaybackSession({ isPlaying: false });
      return;
    }
    void playSessionTrack(next, 0);
  };
}

/**
 * @param {SessionTrack} track
 * @param {number} [seekSec]
 */
export async function playSessionTrack(track, seekSec = 0) {
  if (!track?.sourceRef) return;
  ensurePlaybackSessionEngineHooks();
  const engine = getAudioEngine();
  engine.stop();
  patchPlaybackSession({ isPlaying: false, track });
  try {
    await engine.ensureContext();
    const reuse =
      session.buffer &&
      session.track?.id === track.id &&
      session.track?.sourceRef === track.sourceRef &&
      seekSec === 0;
    const decoded = reuse ? session.buffer : await engine.loadUrl(track.sourceRef);
    engine.setVolume(session.volume);
    engine.playBuffer(decoded, seekSec);
    patchPlaybackSession({
      track,
      buffer: decoded,
      isPlaying: true,
    });
  } catch (err) {
    console.error("[dmp] session play failed", err);
    patchPlaybackSession({ isPlaying: false });
  }
}

export function pauseSession() {
  const engine = getAudioEngine();
  if (!session.isPlaying) return;
  engine.pause();
  patchPlaybackSession({ isPlaying: false });
}

export function resumeSession() {
  if (!session.buffer || !session.track) return;
  ensurePlaybackSessionEngineHooks();
  const engine = getAudioEngine();
  const seekSec = engine.getCurrentTime();
  engine.playBuffer(session.buffer, seekSec);
  patchPlaybackSession({ isPlaying: true });
}

export function toggleSessionPlay() {
  if (session.isPlaying) pauseSession();
  else resumeSession();
}

export function stopSession() {
  const engine = getAudioEngine();
  engine.stop();
  patchPlaybackSession({ isPlaying: false });
}

export function getSessionPositionMs() {
  return Math.floor(getAudioEngine().getCurrentTime() * 1000);
}
