"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const request = useRef(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [device, setDevice] = useState("");
  const stop = useCallback(() => {
    request.current++;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);
  const start = useCallback(
    async (id?: string) => {
      stop();
      const token = ++request.current;
      setStatus("loading");
      setError("");
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error("HTTPS または localhost で開いてください。");
        const media = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            ...(id ? { deviceId: { exact: id } } : { facingMode: "user" }),
          },
        });
        if (token !== request.current) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream.current = media;
        media.getVideoTracks()[0].onended = () => {
          if (token === request.current) {
            stop();
            setError("カメラが切断されました。接続して再開してください。");
            setStatus("error");
          }
        };
        const video = videoRef.current;
        if (!video) {
          stop();
          return;
        }
        video.srcObject = media;
        await video.play();
        if (token !== request.current) return;
        setDevice(media.getVideoTracks()[0].getSettings().deviceId ?? "");
        setStatus("ready");
        try {
          setDevices(
            (await navigator.mediaDevices.enumerateDevices()).filter(
              (d) => d.kind === "videoinput",
            ),
          );
        } catch {
          /* Camera can work without device enumeration. */
        }
      } catch (cause) {
        if (token !== request.current) return;
        stream.current?.getTracks().forEach((track) => track.stop());
        stream.current = null;
        const name = cause instanceof DOMException ? cause.name : "";
        setError(
          name === "NotAllowedError"
            ? "カメラが許可されていません。アドレスバーのカメラ設定を確認して、再試行してください。"
            : name === "NotFoundError"
              ? "カメラが見つかりません。USB接続を確認してください。"
              : name === "NotReadableError"
                ? "カメラを開けません。他のアプリのカメラ使用を終了して、再試行してください。"
                : cause instanceof Error
                  ? cause.message
                  : "カメラを開始できません。接続を確認してください。",
        );
        setStatus("error");
      }
    },
    [stop],
  );
  useEffect(() => {
    const pendingRequest = request;
    const hidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      pendingRequest.current++;
      stream.current?.getTracks().forEach((t) => t.stop());
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [stop]);
  return { videoRef, status, error, devices, device, start, stop };
}
export type CameraController = ReturnType<typeof useCamera>;
