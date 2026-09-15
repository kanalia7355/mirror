import type { Ref } from "react";
export function Canvas({
  canvasRef,
  label,
  width = 640,
  height = 360,
}: {
  canvasRef: Ref<HTMLCanvasElement>;
  label: string;
  width?: number;
  height?: number;
}) {
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      role="img"
      aria-label={label}
    >
      {label}
    </canvas>
  );
}
