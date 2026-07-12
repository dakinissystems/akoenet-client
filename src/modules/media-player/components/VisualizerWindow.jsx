import { useEffect, useRef } from "react";

export function VisualizerWindow({ frequencyData, isPlaying, hasTrack }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

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

      const active = isPlaying && hasTrack;
      const bars = frequencyData?.length || 64;

      if (!active) {
        phaseRef.current += 0.04;
        ctx.fillStyle = "rgba(45, 212, 191, 0.08)";
        ctx.font = "bold 14px Tahoma, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("DAKINIS", width / 2, height / 2 - 8);
        ctx.font = "11px Tahoma, sans-serif";
        ctx.fillStyle = "rgba(136, 136, 136, 0.9)";
        ctx.fillText(hasTrack ? "Paused — press play" : "Drop music or select playlist", width / 2, height / 2 + 12);

        const barW = width / 24;
        for (let i = 0; i < 24; i++) {
          const h = 8 + Math.sin(phaseRef.current + i * 0.35) * 6;
          ctx.fillStyle = `rgba(45, 212, 191, ${0.15 + Math.sin(phaseRef.current + i) * 0.08})`;
          ctx.fillRect(i * barW + 2, height - 24 - h, barW - 3, h);
        }
      } else {
        const barWidth = width / bars;
        for (let i = 0; i < bars; i++) {
          const v = frequencyData[i] || 0;
          const h = (v / 255) * (height - 8);
          const hue = 140 + (v / 255) * 80;
          ctx.fillStyle = `hsl(${hue}, 85%, 48%)`;
          ctx.shadowBlur = v > 180 ? 8 : 0;
          ctx.shadowColor = "rgba(45, 212, 191, 0.6)";
          ctx.fillRect(i * barWidth, height - h, Math.max(1, barWidth - 1), h);
        }
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [frequencyData, isPlaying, hasTrack]);

  return (
    <div className="dmp-viz">
      <div className="dmp-viz__label">Spectrum</div>
      <canvas ref={canvasRef} width={260} height={160} className="dmp-viz__canvas" />
    </div>
  );
}
