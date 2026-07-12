import { memo, useState } from "react";
import { STRINGS } from "../i18n/strings.js";

export const EqualizerWindow = memo(function EqualizerWindow({
  presets,
  presetId,
  bands,
  onPreset,
  onChange,
  onReset,
}) {
  const [advanced, setAdvanced] = useState(false);

  return (
    <div className="dmp-sound">
      <header className="dmp-sound__header">
        <h3>{STRINGS.soundTitle}</h3>
        <p>{STRINGS.soundHint}</p>
      </header>

      <div className="dmp-sound__presets" role="listbox" aria-label={STRINGS.soundTitle}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="option"
            aria-selected={presetId === preset.id}
            className={`dmp-sound__preset${presetId === preset.id ? " is-active" : ""}`}
            onClick={() => onPreset(preset.id)}
          >
            <span className="dmp-sound__preset-label">{preset.label}</span>
            <span className="dmp-sound__preset-desc">{preset.desc}</span>
          </button>
        ))}
      </div>

      <div className="dmp-sound__advanced-toggle">
        <button type="button" className="dmp-action" onClick={() => setAdvanced((v) => !v)}>
          {advanced ? "▲ Ocultar ecualizador manual" : `▼ ${STRINGS.advancedEq}`}
        </button>
      </div>

      {advanced ? (
        <div className="dmp-eq dmp-eq--advanced">
          <p className="dmp-eq__hint">{STRINGS.advancedEqHint}</p>
          <div className="dmp-eq__sliders">
            {bands.map((band, i) => (
              <label key={band.label} className="dmp-eq__band">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={band.gain}
                  onChange={(e) => onChange(i, Number(e.target.value))}
                  aria-label={`${band.label} Hz`}
                />
                <span>{band.label}</span>
              </label>
            ))}
          </div>
          <button type="button" className="dmp-action" onClick={onReset}>
            {STRINGS.reset}
          </button>
        </div>
      ) : null}
    </div>
  );
});
