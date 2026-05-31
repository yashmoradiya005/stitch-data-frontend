"use client";

import React, { useId } from "react";

interface RingProps {
  pct: number;
  size?: number;
  stroke?: number;
  glow?: boolean;
  children?: React.ReactNode;
}

export default function Ring({ pct, size = 132, stroke = 11, glow = true, children }: RingProps) {
  const rawId = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct / 100)));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      {/* overflow="visible" lets the arc glow bleed outside the SVG bounds without a clipping rectangle */}
      <svg width={size} height={size} overflow="visible" style={{ display: "block" }}>
        <defs>
          <linearGradient id={"rg" + rawId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--violet-2)" />
            <stop offset="0.6" stopColor="var(--violet)" />
            <stop offset="1" stopColor="var(--teal)" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--s3)" strokeWidth={stroke} />
        {/* progress arc — glow on the arc itself, not the whole SVG element */}
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#rg${rawId})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)",
            filter: glow ? "drop-shadow(0 0 6px rgba(109,93,245,.55))" : "none",
          }}
        />
      </svg>
      <div className="ring__center">{children}</div>
    </div>
  );
}
