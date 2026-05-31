"use client";

import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: number;
}

export default function Modal({ open, onClose, children, maxW = 360 }: ModalProps) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop show" onClick={onClose} />
      <div className="modal-center" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: maxW }} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </>
  );
}
