import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAudioEngine } from "../services/audioEngine.js";
import {
  ensurePlaybackSessionEngineHooks,
  getPlaybackSession,
  getSessionPositionMs,
  patchPlaybackSession,
  playSessionTrack,
  stopSession,
  subscribePlaybackSession,
  toggleSessionPlay,
} from "../services/playbackSession.js";
import { usePlayerStore } from "../store/playerStore.jsx";

const POSITION_TICK_MS = 250;

export function usePlayer({ tracks = [] } = {}) {
  const { state, dispatch } = usePlayerStore();
  const audioEngine = getAudioEngine();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    ensurePlaybackSessionEngineHooks();
    return subscribePlaybackSession(() => setTick((n) => n + 1));
  }, []);

  // Keep playlist / shuffle / repeat on the session so auto-next works off-route.
  useEffect(() => {
    patchPlaybackSession({
      ...(tracks.length ? { tracks } : {}),
      shuffle: state.shuffle,
      repeat: state.repeat,
      volume: state.volume,
    });
    audioEngine.setVolume(state.volume);
  }, [audioEngine, tracks, state.shuffle, state.repeat, state.volume]);

  const session = getPlaybackSession();
  const currentTrack = session.track;
  const isPlaying = session.isPlaying;
  const buffer = session.buffer;

  const [positionMs, setPositionMs] = useState(() => getSessionPositionMs());
  const [loading, setLoading] = useState(false);

  // Rehydrate position when returning to /media while audio still runs.
  useEffect(() => {
    setPositionMs(getSessionPositionMs());
  }, [tick, currentTrack?.id]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => {
      setPositionMs(getSessionPositionMs());
    }, POSITION_TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  const play = useCallback(async (track, seekSec = 0) => {
    if (!track?.sourceRef) return;
    setLoading(true);
    try {
      await playSessionTrack(track, seekSec);
      setPositionMs(Math.floor(seekSec * 1000));
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!buffer || !currentTrack) return;
    toggleSessionPlay();
  }, [buffer, currentTrack]);

  const stop = useCallback(() => {
    stopSession();
    setPositionMs(0);
  }, []);

  const seek = useCallback(
    (ms) => {
      if (!buffer || !currentTrack) return;
      const sec = Math.max(0, ms / 1000);
      audioEngine.playBuffer(buffer, sec);
      patchPlaybackSession({ isPlaying: true });
      setPositionMs(Math.floor(sec * 1000));
    },
    [audioEngine, buffer, currentTrack],
  );

  const playNext = useCallback(() => {
    if (!tracks.length || !currentTrack) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = idx < 0 ? 0 : (idx + 1) % tracks.length;
    play(tracks[nextIdx], 0);
  }, [tracks, currentTrack, play]);

  const playPrevious = useCallback(() => {
    if (!tracks.length || !currentTrack) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
    play(tracks[prevIdx], 0);
  }, [tracks, currentTrack, play]);

  const setVolume = useCallback((v) => dispatch({ type: "SET_VOLUME", payload: v }), [dispatch]);

  return useMemo(
    () => ({
      audioEngine,
      currentTrack,
      isPlaying,
      loading,
      positionMs,
      volume: state.volume,
      play,
      togglePlay,
      stop,
      seek,
      playNext,
      playPrevious,
      setVolume,
    }),
    [
      audioEngine,
      currentTrack,
      isPlaying,
      loading,
      positionMs,
      state.volume,
      play,
      togglePlay,
      stop,
      seek,
      playNext,
      playPrevious,
      setVolume,
    ],
  );
}
