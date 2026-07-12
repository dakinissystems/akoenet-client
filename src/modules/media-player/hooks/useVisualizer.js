import { useEffect } from "react";

/** Enables analyser FFT only when the visualizer window is open */
export function useVisualizer(audioEngine, enabled) {
  useEffect(() => {
    audioEngine?.setAnalyserActive?.(enabled);
    return () => audioEngine?.setAnalyserActive?.(false);
  }, [audioEngine, enabled]);

  return { analyser: enabled ? audioEngine?.getAnalyser?.() ?? null : null };
}
