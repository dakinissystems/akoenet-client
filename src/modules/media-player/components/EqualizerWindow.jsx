export function EqualizerWindow({ bands, onChange }) {
  return (
    <div className="dmp-eq">
      <div className="dmp-eq__sliders">
        {bands.map((band, i) => (
          <label key={band.label} className="dmp-eq__band">
            <input
              type="range"
              orient="vertical"
              min="-12"
              max="12"
              step="1"
              value={band.gain}
              onChange={(e) => onChange(i, Number(e.target.value))}
            />
            <span>{band.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
