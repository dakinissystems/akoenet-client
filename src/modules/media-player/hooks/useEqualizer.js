import { useCallback, useMemo, useState } from "react";
import { EQ_BAND_LABELS } from "../services/audioEngine.js";

export function useEqualizer(audioEngine) {
  const [bands, setBands] = useState(() => EQ_BAND_LABELS.map((label) => ({ label, gain: 0 })));

  const setBand = useCallback(
    (index, gain) => {
      setBands((prev) => prev.map((b, i) => (i === index ? { ...b, gain } : b)));
      audioEngine?.setEqBand(index, gain);
    },
    [audioEngine],
  );

  const reset = useCallback(() => {
    EQ_BAND_LABELS.forEach((_, i) => audioEngine?.setEqBand(i, 0));
    setBands(EQ_BAND_LABELS.map((label) => ({ label, gain: 0 })));
  }, [audioEngine]);

  return useMemo(() => ({ bands, setBand, reset }), [bands, setBand, reset]);
}
