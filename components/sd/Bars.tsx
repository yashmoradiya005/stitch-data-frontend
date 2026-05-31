"use client";

import React from "react";
import { nums } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface BarsProps {
  data: { d: string; total: number }[];
  lang: Lang;
}

export default function Bars({ data, lang }: BarsProps) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 132 }}>
      {data.map((d, i) => {
        const isMax = d.total === max;
        const hpx = Math.max(6, (d.total / max) * 104);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 0 }}>
            <span className="num" style={{ fontSize: 8.5, fontWeight: 800, color: isMax ? "var(--gold)" : "var(--low)" }}>
              {nums((d.total / 1000).toFixed(0), lang)}k
            </span>
            <div style={{
              width: "100%", height: hpx, borderRadius: "5px 5px 3px 3px",
              background: isMax
                ? "linear-gradient(180deg,var(--gold),#caa047)"
                : "linear-gradient(180deg,var(--violet),var(--violet-2))",
              boxShadow: isMax ? "var(--glow-gold)" : "none",
              transition: "height .8s cubic-bezier(.16,1,.3,1)",
            }} />
            <span style={{ fontSize: 8, color: "var(--low)" }}>
              {nums(d.d.split(" ")[1] || d.d, lang)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
