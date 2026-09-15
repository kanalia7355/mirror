"use client";
import { useEffect, useRef } from "react";
export function useAnimationFrame(
  callback: (time: number, delta: number) => void,
  active = true,
  fps = 30,
) {
  const fn = useRef(callback);
  useEffect(() => {
    fn.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!active) return;
    let frame = 0,
      previous = 0;
    const tick = (time: number) => {
      if (time - previous >= 1000 / fps) {
        const delta = previous ? Math.min((time - previous) / 1000, 0.1) : 0;
        previous = time;
        fn.current(time, delta);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, fps]);
}
