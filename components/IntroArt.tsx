"use client";
import { useEffect, useRef } from "react";
import { drawSample, themeColors } from "@/lib/drawing";
export function IntroArt({ kind }: { kind: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = themeColors();
    ctx.fillStyle = c["paper-2"];
    ctx.fillRect(0, 0, 640, 400);
    if (kind === "gesture-game") {
      ctx.strokeStyle = c.rule;
      for (let x = 0; x < 640; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }
      ctx.fillStyle = c.ink;
      [
        [110, 60, 18],
        [410, 150, 25],
        [275, 260, 15],
        [520, 45, 12],
      ].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = c.accent;
      ctx.fillRect(300, 334, 40, 28);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(210, 348);
      ctx.lineTo(280, 348);
      ctx.moveTo(365, 348);
      ctx.lineTo(440, 348);
      ctx.moveTo(220, 338);
      ctx.lineTo(210, 348);
      ctx.lineTo(220, 358);
      ctx.moveTo(430, 338);
      ctx.lineTo(440, 348);
      ctx.lineTo(430, 358);
      ctx.stroke();
    } else if (kind === "invisible-mirror") {
      for (let x = 20; x < 640; x += 35)
        for (let y = 20; y < 400; y += 35) {
          ctx.fillStyle = c.rule;
          ctx.fillRect(x, y, 2, 2);
        }
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      ctx.arc(320, 110, 43, 0, Math.PI * 2);
      ctx.moveTo(254, 178);
      ctx.quadraticCurveTo(320, 152, 386, 178);
      ctx.lineTo(400, 340);
      ctx.lineTo(240, 340);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.ink;
      ctx.font =
        "400 18px " +
        getComputedStyle(document.documentElement).getPropertyValue(
          "--font-body",
        );
      ctx.fillText("人物領域 → 背景", 28, 370);
    } else {
      const buffer = document.createElement("canvas");
      buffer.width = 320;
      buffer.height = 200;
      const bc = buffer.getContext("2d", { willReadFrequently: true });
      if (!bc) return;
      drawSample(bc, 0, 320, 200);
      const original = bc.getImageData(0, 0, 320, 200);
      for (let n = 0; n < 4; n++) {
        const pixels = new ImageData(
          new Uint8ClampedArray(original.data),
          320,
          200,
        );
        for (let i = 0; i < pixels.data.length; i += 4) {
          const grey =
            pixels.data[i] * 0.299 +
            pixels.data[i + 1] * 0.587 +
            pixels.data[i + 2] * 0.114;
          if (n === 1)
            pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = grey;
          if (n === 2)
            pixels.data[i] =
              pixels.data[i + 1] =
              pixels.data[i + 2] =
                grey > 128 ? 240 : 20;
          if (n === 3)
            for (let ch = 0; ch < 3; ch++)
              pixels.data[i + ch] = 255 - pixels.data[i + ch];
        }
        bc.putImageData(pixels, 0, 0);
        ctx.drawImage(buffer, (n % 2) * 320, Math.floor(n / 2) * 200);
      }
    }
  }, [kind]);
  return (
    <canvas
      ref={canvas}
      width={640}
      height={400}
      role="img"
      aria-label="展示内容の説明図。実際のカメラ映像ではありません。"
    />
  );
}
