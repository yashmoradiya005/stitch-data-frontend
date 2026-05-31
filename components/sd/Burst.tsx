"use client";

import React from "react";

interface BurstProps {
  run: boolean;
}

export default function Burst({ run }: BurstProps) {
  if (!run) return null;
  const cols = ["var(--gold)", "var(--violet)", "var(--teal)", "#f6dca0"];
  return (
    <div className="burst">
      {Array.from({ length: 22 }).map((_, i) => {
        const ang = (i / 22) * Math.PI * 2;
        const dist = 70 + Math.random() * 70;
        return (
          <i
            key={i}
            style={{
              left: "50%",
              top: "38%",
              background: cols[i % cols.length],
              "--dx": `${Math.cos(ang) * dist}px`,
              "--dy": `${Math.sin(ang) * dist}px`,
              animation: `shoot ${700 + Math.random() * 500}ms cubic-bezier(.16,1,.3,1) forwards`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
