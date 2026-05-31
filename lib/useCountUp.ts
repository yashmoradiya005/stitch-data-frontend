"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const startVal = prevRef.current;
    startRef.current = null;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = target;
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
