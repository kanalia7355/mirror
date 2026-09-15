import { mkdir, writeFile, readFile, cp } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
const records = [];
async function download(url, path) {
  let data;
  try {
    data = await readFile(path);
  } catch {
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    data = Buffer.from(await response.arrayBuffer());
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  }
  records.push({
    path,
    url,
    sha256: createHash("sha256").update(data).digest("hex"),
    bytes: data.length,
  });
  console.log(path);
  return data;
}
await mkdir("public/vendor/mediapipe", { recursive: true });
await cp(
  "node_modules/@mediapipe/tasks-vision/wasm",
  "public/vendor/mediapipe",
  { recursive: true },
);
await download(
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
  "public/models/selfie_segmenter.tflite",
);
await writeFile(
  "public/assets-manifest.json",
  JSON.stringify(records, null, 2),
);
