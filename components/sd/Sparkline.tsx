"use client";

import React, { useId } from "react";

interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
}

export default function Sparkline({ data, height = 64, color = "var(--violet)" }: SparklineProps) {
  const rawId = useId().replace(/:/g, "");
  const w = 300;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const sx = (i: number) => (i / (data.length - 1)) * w;
  const sy = (v: number) => h - 6 - ((v - min) / (max - min || 1)) * (h - 12);
  const line = data.map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id={"sg" + rawId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${rawId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
