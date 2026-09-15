"use client";
import { useEffect, useRef, useState } from "react";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";
import { useCamera } from "@/hooks/useCamera";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { composite, type Mode } from "@/lib/imageProcessing/composite";
import { themeColors } from "@/lib/drawing";
import { Camera } from "./Camera";
import { Canvas } from "./Canvas";
import { PermissionDialog } from "./PermissionDialog";
import { Status } from "./Status";
const modes: Mode[] = ["Transparent", "Ghost", "Outline", "Matrix"];
export default function Experience() {
  const camera = useCamera(),
    output = useRef<HTMLCanvasElement>(null),
    previews = useRef<(HTMLCanvasElement | null)[]>([]),
    input = useRef<HTMLCanvasElement | null>(null),
    background = useRef<ImageData | null>(null),
    model = useRef<ImageSegmenter | null>(null),
    mask = useRef<{ data: Float32Array; width: number; height: number } | null>(
      null,
    );
  const mounted = useRef(0),
    last = useRef(0),
    lastVideo = useRef(-1),
    captureAt = useRef(0),
    backgroundDevice = useRef("");
  const [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [captured, setCaptured] = useState(false),
    [countdown, setCountdown] = useState(0),
    [mode, setMode] = useState<Mode>("Transparent"),
    [threshold, setThreshold] = useState(0.55),
    [coverage, setCoverage] = useState(0),
    [fps, setFps] = useState(0);
  const frames = useRef({ n: 0, time: 0 });
  useEffect(() => {
    const life = mounted;
    life.current++;
    return () => {
      life.current++;
      model.current?.close();
      model.current = null;
      background.current = null;
      mask.current = null;
    };
  }, []);
  const initialize = async () => {
    const id = mounted.current;
    setBusy(true);
    setError("");
    try {
      const { FilesetResolver, ImageSegmenter } =
        await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks("/vendor/mediapipe");
      const instance = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/selfie_segmenter.tflite",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
      if (id !== mounted.current) {
        instance.close();
        return;
      }
      model.current?.close();
      model.current = instance;
      setReady(true);
    } catch {
      if (id === mounted.current)
        setError(
          "人物認識モデルを読み込めません。配信ファイルを確認して再試行してください。",
        );
    } finally {
      if (id === mounted.current) setBusy(false);
    }
  };
  const shoot = () => {
    captureAt.current = performance.now() + 3000;
    setCountdown(3);
  };
  useAnimationFrame(
    (time) => {
      const canvas = output.current,
        ctx = canvas?.getContext("2d");
      if (!ctx) return;
      if (
        camera.status !== "ready" ||
        !camera.videoRef.current ||
        camera.videoRef.current.readyState < 2
      ) {
        if (captureAt.current) {
          captureAt.current = 0;
          setCountdown(0);
        }
        const c = themeColors();
        ctx.fillStyle = c["paper-2"];
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = c.ink;
        ctx.font = `24px ${getComputedStyle(document.documentElement).getPropertyValue("--font-body")}`;
        ctx.textAlign = "center";
        ctx.fillText("カメラを開始してください", 320, 180);
        return;
      }
      if (background.current && backgroundDevice.current !== camera.device) {
        background.current = null;
        mask.current = null;
        setCaptured(false);
      }
      const small =
        input.current ?? (input.current = document.createElement("canvas"));
      if (small.width !== 320) {
        small.width = 320;
        small.height = 180;
      }
      const sc = small.getContext("2d", { willReadFrequently: true });
      if (!sc) return;
      sc.save();
      sc.translate(320, 0);
      sc.scale(-1, 1);
      sc.drawImage(camera.videoRef.current, 0, 0, 320, 180);
      sc.restore();
      const current = sc.getImageData(0, 0, 320, 180);
      if (captureAt.current) {
        const remaining = Math.ceil((captureAt.current - time) / 1000);
        setCountdown(Math.max(0, remaining));
        if (remaining <= 0) {
          background.current = new ImageData(
            new Uint8ClampedArray(current.data),
            320,
            180,
          );
          backgroundDevice.current = camera.device;
          setCaptured(true);
          captureAt.current = 0;
        }
      }
      if (
        model.current &&
        ready &&
        time - last.current >= 100 &&
        lastVideo.current !== camera.videoRef.current.currentTime
      ) {
        last.current = time;
        lastVideo.current = camera.videoRef.current.currentTime;
        try {
          model.current.segmentForVideo(small, time, (result) => {
            const person = result.confidenceMasks?.[0];
            if (!person) return;
            const data = new Float32Array(person.getAsFloat32Array());
            mask.current = { data, width: person.width, height: person.height };
            let n = 0;
            for (const p of data) if (p >= threshold) n++;
            setCoverage(Math.round((n / data.length) * 100));
          });
        } catch {
          setError("人物認識が停止しました。モデルを再読み込みしてください。");
          setReady(false);
          mask.current = null;
        }
      }
      const raw = previews.current[0]?.getContext("2d");
      raw?.putImageData(current, 0, 0);
      const m = mask.current,
        bg = background.current;
      if (m) {
        const view = new ImageData(320, 180);
        for (let y = 0; y < 180; y++)
          for (let x = 0; x < 320; x++) {
            const i = (y * 320 + x) * 4,
              p =
                m.data[
                  Math.floor((y * m.height) / 180) * m.width +
                    Math.floor((x * m.width) / 320)
                ],
              value = p >= threshold ? 230 : 20;
            view.data[i] = view.data[i + 1] = view.data[i + 2] = value;
            view.data[i + 3] = 255;
          }
        previews.current[1]?.getContext("2d")?.putImageData(view, 0, 0);
      }
      if (bg) previews.current[2]?.getContext("2d")?.putImageData(bg, 0, 0);
      if (bg && m)
        sc.putImageData(
          composite(
            current,
            bg,
            m.data,
            m.width,
            m.height,
            mode,
            threshold,
            time,
          ),
          0,
          0,
        );
      ctx.drawImage(small, 0, 0, 640, 360);
      previews.current[3]?.getContext("2d")?.drawImage(small, 0, 0);
      frames.current.n++;
      if (time - frames.current.time > 1000) {
        setFps(
          Math.round((frames.current.n * 1000) / (time - frames.current.time)),
        );
        frames.current = { n: 0, time };
      }
    },
    true,
    30,
  );
  return (
    <>
      <div className="intro">
        <h1>背景だけが、残る。</h1>
        <p>
          カメラを固定して背景を撮影したら、フレームの中に戻ってみてください。
        </p>
      </div>
      <ol className="steps">
        <li aria-current={camera.status !== "ready" ? "step" : undefined}>
          1. カメラを固定
        </li>
        <li
          aria-current={
            camera.status === "ready" && !captured ? "step" : undefined
          }
        >
          2. 人のいない背景を撮影
        </li>
        <li aria-current={captured ? "step" : undefined}>3. フレームに戻る</li>
      </ol>
      <div className="workspace">
        <section>
          <div className="stage">
            <Canvas canvasRef={output} label="人物領域を背景で置き換えた映像" />
          </div>
          <Camera videoRef={camera.videoRef} />
          <PermissionDialog camera={camera} />
        </section>
        <aside className="panel">
          <h2>背景を覚える</h2>
          <p>
            3秒の間に画面の外へ移動してください。背景は、このページを開いている間だけ保持します。
          </p>
          <button
            className="button primary"
            disabled={camera.status !== "ready" || countdown > 0}
            onClick={shoot}
          >
            {countdown
              ? `撮影まで ${countdown} 秒`
              : captured
                ? "背景を撮り直す"
                : "3秒後に背景を撮影"}
          </button>
          <p role="status">
            {captured
              ? "背景を撮影しました。カメラの位置を変えたら撮り直してください。"
              : "背景はまだ撮影されていません。"}
          </p>
          <h2 className="mt-8">見え方</h2>
          <div className="filter-list">
            {modes.map((m) => (
              <button
                className="button"
                key={m}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <label>
            人物とみなすしきい値
            <output className="readout">{threshold.toFixed(2)}</output>
            <input
              aria-label="人物とみなすしきい値"
              type="range"
              min="0.2"
              max="0.9"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(+e.target.value)}
            />
          </label>
          {!ready && (
            <button
              className="button"
              disabled={busy}
              onClick={() => void initialize()}
            >
              人物認識を準備
            </button>
          )}
          <Status
            busy={busy}
            error={error}
            message={
              ready
                ? "人物認識 準備完了"
                : "カメラと人物認識を開始してから背景を撮影してください。"
            }
            retry={() => void initialize()}
          />
          <div className="metrics">
            <div>
              <small>人物領域の面積</small>
              <strong>
                {coverage}
                <small> %</small>
              </strong>
            </div>
            <div>
              <small>描画</small>
              <strong>
                {fps}
                <small> FPS</small>
              </strong>
            </div>
          </div>
          <p className="privacy">
            面積は画像中で人物と判定した割合です。認識精度の数値ではありません。
          </p>
        </aside>
      </div>
      <h2 className="mt-10">透明化の内側</h2>
      <div className="process">
        {["入力映像", "人物マスク", "撮影した背景", "合成結果"].map(
          (label, i) => (
            <figure key={label}>
              <canvas
                ref={(el) => {
                  previews.current[i] = el;
                }}
                width={320}
                height={180}
                role="img"
                aria-label={label}
              />
              <figcaption>
                {i + 1}. {label}
              </figcaption>
            </figure>
          ),
        )}
      </div>
    </>
  );
}
