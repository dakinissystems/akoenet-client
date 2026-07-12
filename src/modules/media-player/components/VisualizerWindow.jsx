import { memo, useEffect, useRef } from "react";
import { STRINGS } from "../i18n/strings.js";

const BAR_COUNT = 32;

export const VisualizerWindow = memo(function VisualizerWindow({ analyser, isPlaying, hasTrack }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);
  const dataRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf;
    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, width, height);

      const active = isPlaying && hasTrack && analyser;

      if (!active) {
        phaseRef.current += 0.03;
        ctx.font = "600 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(45, 212, 191, 0.85)";
        ctx.fillText(STRINGS.visualizer, width / 2, height / 2 - 10);
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillStyle = "rgba(136, 136, 136, 0.95)";
        ctx.fillText(
          hasTrack ? STRINGS.visualizerPaused : STRINGS.visualizerEmpty,
          width / 2,
          height / 2 + 12,
        );

        const barW = width / 20;
        for (let i = 0; i < 20; i++) {
          const h = 6 + Math.sin(phaseRef.current + i * 0.35) * 5;
          ctx.fillStyle = `rgba(45, 212, 191, ${0.12 + Math.sin(phaseRef.current + i) * 0.06})`;
          ctx.fillRect(i * barW + 2, height - 20 - h, barW - 3, h);
        }
      } else {
        if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
          dataRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataRef.current);
        const data = dataRef.current;
        const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
        const barWidth = width / BAR_COUNT;

        for (let i = 0; i < BAR_COUNT; i++) {
          const v = data[i * step] || 0;
          const h = (v / 255) * (height - 12);
          const hue = 150 + (v / 255) * 60;
          ctx.fillStyle = `hsl(${hue}, 75%, 45%)`;
          ctx.fillRect(i * barWidth + 1, height - h, Math.max(2, barWidth - 2), h);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser, isPlaying, hasTrack]);

  return (
    <div className="dmp-viz">
      <div className="dmp-viz__label">{STRINGS.visualizer}</div>
      <p className="dmp-viz__hint">{STRINGS.visualizerHint}</p>
      <canvas ref={canvasRef} width={260} height={160} className="dmp-viz__canvas" />
    </div>
  );
});
