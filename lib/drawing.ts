export function themeColors() {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    ["paper", "paper-2", "ink", "muted", "accent", "rule"].map((k) => [
      k,
      css.getPropertyValue(`--color-${k}`).trim(),
    ]),
  );
}
export function drawSample(
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number,
) {
  const c = themeColors();
  ctx.fillStyle = c["paper-2"];
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? c.ink : c.paper;
    ctx.fillRect((i * width) / 8, height * 0.67, width / 8, height * 0.33);
  }
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(
    width * 0.35 + Math.sin(time / 1800) * width * 0.1,
    height * 0.37,
    height * 0.19,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = c.ink;
  ctx.fillRect(width * 0.63, height * 0.19, width * 0.17, height * 0.34);
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.65);
  ctx.lineTo(width, height * 0.1);
  ctx.stroke();
}
