"use client";

import React from "react";

interface SwitchProps {
  on: boolean;
  onClick: () => void;
}

export default function Switch({ on, onClick }: SwitchProps) {
  return (
    <div className={"switch" + (on ? " on" : "")} onClick={onClick}>
      <i />
    </div>
  );
}
