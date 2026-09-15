export type Mode = "Transparent" | "Ghost" | "Outline" | "Matrix";
export function composite(
  current: ImageData,
  background: ImageData,
  mask: Float32Array,
  maskWidth: number,
  maskHeight: number,
  mode: Mode,
  threshold: number,
  time: number,
) {
  const { width, height } = current,
    result = new ImageData(width, height);
  const at = (x: number, y: number) =>
    mask[
      Math.min(
        maskHeight - 1,
        Math.max(0, Math.floor((y * maskHeight) / height)),
      ) *
        maskWidth +
        Math.min(
          maskWidth - 1,
          Math.max(0, Math.floor((x * maskWidth) / width)),
        )
    ];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4,
        p = at(x, y),
        alpha = Math.max(0, Math.min(1, (p - threshold + 0.08) / 0.16));
      const edge =
        p >= threshold &&
        [at(x - 2, y), at(x + 2, y), at(x, y - 2), at(x, y + 2)].some(
          (v) => v < threshold,
        );
      for (let c = 0; c < 3; c++) {
        const original = current.data[i + c],
          bg = background.data[i + c];
        if (mode === "Transparent")
          result.data[i + c] = original * (1 - alpha) + bg * alpha;
        else if (mode === "Ghost")
          result.data[i + c] = original * (1 - alpha * 0.5) + bg * alpha * 0.5;
        else if (mode === "Outline")
          result.data[i + c] = edge
            ? [113, 211, 230][c]
            : original * (1 - alpha) + bg * alpha;
        else {
          const lit =
            (Math.floor(x / 7) * 13 +
              Math.floor(y / 10) +
              Math.floor(time / 140)) %
              11 <
            3;
          const digit = lit && x % 7 < 4 && y % 10 < 7;
          result.data[i + c] =
            original * (1 - alpha) +
            (digit ? [125, 235, 168][c] : [15, 30, 27][c]) * alpha;
        }
      }
      result.data[i + 3] = 255;
    }
  return result;
}
