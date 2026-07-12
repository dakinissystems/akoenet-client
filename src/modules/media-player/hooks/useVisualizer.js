import { useEffect, useState } from "react";

export function useVisualizer(audioEngine) {
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(128));

  useEffect(() => {
    const analyser = audioEngine?.getAnalyser?.();
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setFrequencyData(new Uint8Array(data));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioEngine]);

  return { frequencyData };
}
