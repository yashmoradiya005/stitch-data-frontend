"use client";

import React from "react";

interface AvatarProps {
  name: string;
  grad?: number;
  size?: number;
  style?: React.CSSProperties;
}

export function nameToGrad(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 6;
}

export default function Avatar({ name, grad, size = 42, style }: AvatarProps) {
  const g = grad !== undefined ? grad : nameToGrad(name);
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <div
      className={`avatar av-grad-${g}`}
      style={{ width: size, height: size, fontSize: size * 0.4, ...style }}
    >
      {initial}
    </div>
  );
}
