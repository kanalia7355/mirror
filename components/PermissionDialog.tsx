"use client";
import type { CameraController } from "@/hooks/useCamera";
export function PermissionDialog({ camera }: { camera: CameraController }) {
  return (
    <section className="camera-controls" aria-label="カメラ設定">
      <p className="privacy">
        この展示ではカメラを使用します。映像は画像処理のみに利用し、サーバーへの送信・保存は行いません。
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="button primary"
          onClick={() =>
            camera.status === "ready" ? camera.stop() : void camera.start()
          }
          disabled={camera.status === "loading"}
        >
          {camera.status === "ready"
            ? "カメラを停止"
            : camera.status === "loading"
              ? "カメラ接続中…"
              : "カメラを許可して開始"}
        </button>
        {camera.devices.length > 1 && (
          <label>
            カメラ
            <select
              value={camera.device}
              disabled={camera.status === "loading"}
              onChange={(e) => void camera.start(e.target.value)}
            >
              {camera.devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `カメラ ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        )}
        <span role="status">
          {camera.status === "ready" ? "カメラ接続済み" : "停止中"}
        </span>
      </div>
      {camera.error && (
        <p role="alert" className="error">
          {camera.error}
        </p>
      )}
    </section>
  );
}
