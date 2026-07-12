import { useCallback, useMemo, useState } from "react";
import { EQ_BAND_LABELS, EQ_PRESETS, EQ_PRESET_LIST } from "../i18n/strings.js";

export function useEqualizer(audioEngine) {
  const [presetId, setPresetId] = useState("normal");
  const [bands, setBands] = useState(() => EQ_BAND_LABELS.map((label) => ({ label, gain: 0 })));

  const applyGains = useCallback(
    (gains) => {
      const isFlat = gains.every((g) => g === 0);
      if (isFlat) {
        audioEngine?.setAllEqFlat?.();
      } else {
        gains.forEach((gain, i) => audioEngine?.setEqBand(i, gain));
      }
      setBands(EQ_BAND_LABELS.map((label, i) => ({ label, gain: gains[i] ?? 0 })));
    },
    [audioEngine],
  );

  const applyPreset = useCallback(
    (id) => {
      const preset = EQ_PRESETS[id] ?? EQ_PRESETS.normal;
      setPresetId(id);
      applyGains(preset.gains);
    },
    [applyGains],
  );

  const setBand = useCallback(
    (index, gain) => {
      setPresetId("custom");
      setBands((prev) => prev.map((b, i) => (i === index ? { ...b, gain } : b)));
      audioEngine?.setEqBand(index, gain);
    },
    [audioEngine],
  );

  const reset = useCallback(() => {
    applyPreset("normal");
  }, [applyPreset]);

  return useMemo(
    () => ({ bands, presetId, presets: EQ_PRESET_LIST, setBand, applyPreset, reset }),
    [bands, presetId, setBand, applyPreset, reset],
  );
}
