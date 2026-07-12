import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioEngine } from "../services/audioEngine.js";
import { usePlayerStore } from "../store/playerStore.jsx";

export function usePlayer() {
  const { state, dispatch } = usePlayerStore();
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();

  const [currentTrack, setCurrentTrack] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [loading, setLoading] = useState(false);

  const audioEngine = engineRef.current;

  useEffect(() => {
    audioEngine.setVolume(state.volume);
  }, [audioEngine, state.volume]);

  useEffect(() => {
    let raf;
    const tick = () => {
      if (isPlaying) {
        setPositionMs(Math.floor(audioEngine.getCurrentTime() * 1000));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioEngine, isPlaying]);

  const play = useCallback(
    async (track) => {
      if (!track?.sourceRef) return;
      setLoading(true);
      try {
        const decoded = await audioEngine.loadUrl(track.sourceRef);
        setBuffer(decoded);
        setCurrentTrack(track);
        audioEngine.playBuffer(decoded);
        setIsPlaying(true);
      } catch (err) {
        console.error("[dmp] play failed", err);
      } finally {
        setLoading(false);
      }
    },
    [audioEngine],
  );

  const togglePlay = useCallback(() => {
    if (!buffer || !currentTrack) return;
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.playBuffer(buffer, positionMs / 1000);
      setIsPlaying(true);
    }
  }, [audioEngine, buffer, currentTrack, isPlaying, positionMs]);

  const stop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setPositionMs(0);
  }, [audioEngine]);

  const setVolume = useCallback(
    (v) => dispatch({ type: "SET_VOLUME", payload: v }),
    [dispatch],
  );

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
      setVolume,
    ],
  );
}
