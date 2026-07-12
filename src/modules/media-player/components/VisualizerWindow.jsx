import { useRef, useEffect } from "react";

export function VisualizerWindow({ frequencyData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    const barWidth = width / frequencyData.length;
    for (let i = 0; i < frequencyData.length; i++) {
      const h = (frequencyData[i] / 255) * height;
      const hue = 140 + (frequencyData[i] / 255) * 60;
      ctx.fillStyle = `hsl(${hue}, 80%, 45%)`;
      ctx.fillRect(i * barWidth, height - h, barWidth - 1, h);
    }
  }, [frequencyData]);

  return (
    <div className="dmp-viz">
      <canvas ref={canvasRef} width={260} height={160} className="dmp-viz__canvas" />
    </div>
  );
}
