"use client";

import React, { useEffect, useState } from "react";
import { close as CloseIcon } from "./Icons";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string | null;
  children: React.ReactNode;
}

export default function Sheet({ open, onClose, title, sub, children }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = setTimeout(() => setShow(true), 20);
      return () => clearTimeout(r);
    } else {
      setShow(false);
      const timer = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;
  return (
    <>
      <div className={"sheet-backdrop" + (show ? " show" : "")} onClick={onClose} />
      <div className={"sheet" + (show ? " show" : "")}>
        <div className="sheet__grip" />
        <div className="sheet__head">
          <div style={{ minWidth: 0 }}>
            <h3 className="display" style={{ fontSize: 23, color: "var(--hi)" }}>{title}</h3>
            {sub && <p style={{ fontSize: 12, color: "var(--mid)", marginTop: 3 }}>{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} style={{ background: "var(--s2)" }}>
            <CloseIcon w={18} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </>
  );
}
