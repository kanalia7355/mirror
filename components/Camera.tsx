"use client";
import type { Ref } from "react";
export function Camera({
  videoRef,
  preview = false,
}: {
  videoRef: Ref<HTMLVideoElement>;
  preview?: boolean;
}) {
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={preview ? "camera-preview" : "capture-video"}
      aria-label="カメラ映像"
    />
  );
}
