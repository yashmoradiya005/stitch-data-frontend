"use client";

import React from "react";

interface IconProps {
  w?: number;
  className?: string;
  style?: React.CSSProperties;
}

const S = ({ d, fill, children, w = 22, sw = 1.75, className, style, ...p }: {
  d?: string; fill?: string; children?: React.ReactNode;
  w?: number; sw?: number; className?: string; style?: React.CSSProperties;
}) => (
  <svg width={w} height={w} viewBox="0 0 24 24"
    fill={fill || "none"}
    stroke={fill ? "none" : "currentColor"}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style} {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const home = (p: IconProps) => <S {...p} d="M3 11.5 12 4l9 7.5M5.5 10v9.5a1 1 0 0 0 1 1H9.5v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h3a1 1 0 0 0 1-1V10" />;
export const users = (p: IconProps) => <S {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 5.2A3 3 0 0 1 18.5 11M17 15.4c2.2.5 3.8 2.3 3.8 4.6" /></S>;
export const chart = (p: IconProps) => <S {...p}><rect x="3" y="12" width="4" height="8" rx="1" /><rect x="10" y="7" width="4" height="13" rx="1" /><rect x="17" y="3.5" width="4" height="16.5" rx="1" /></S>;
export const doc = (p: IconProps) => <S {...p}><path d="M13 3H6.5a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9z" /><path d="M13 3v6h6M8.5 13h7M8.5 16.5h7M8.5 9.5H10" /></S>;
export const plus = (p: IconProps) => <S {...p} d="M12 5v14M5 12h14" sw={2.2} />;
export const chevDown = (p: IconProps) => <S {...p} d="M5 9l7 7 7-7" sw={2.2} w={p.w || 16} />;
export const chevRight = (p: IconProps) => <S {...p} d="M9 5l7 7-7 7" sw={2.2} w={p.w || 16} />;
export const chevLeft = (p: IconProps) => <S {...p} d="M15 5l-7 7 7 7" sw={2.2} w={p.w || 16} />;
export const close = (p: IconProps) => <S {...p} d="M6 6l12 12M18 6L6 18" sw={2.2} />;
export const sun = (p: IconProps) => <S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M19.5 4.5l-1.8 1.8M6.3 17.7l-1.8 1.8" /></S>;
export const moon = (p: IconProps) => <S {...p} d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.6 6.6 0 0 0 11 11z" />;
export const search = (p: IconProps) => <S {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></S>;
export const edit = (p: IconProps) => <S {...p} d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" w={p.w || 18} />;
export const trash = (p: IconProps) => <S {...p} d="M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" w={p.w || 18} />;
export const user = (p: IconProps) => <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></S>;
export const phone = (p: IconProps) => <S {...p} d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" w={p.w || 16} />;
export const rupee = (p: IconProps) => <S {...p} d="M7 4h10M7 8h10M16 4c0 4-3 5-7 5h-1l7 7" w={p.w || 16} />;
export const calendar = (p: IconProps) => <S {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></S>;
export const cog = (p: IconProps) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.5l1.4 2.3 2.6-.6.5 2.6 2.3 1.3-1.2 2.4 1.2 2.4-2.3 1.3-.5 2.6-2.6-.6L12 21.5l-1.4-2.3-2.6.6-.5-2.6-2.3-1.3 1.2-2.4-1.2-2.4 2.3-1.3.5-2.6 2.6.6z" strokeWidth={1.4} /></S>;
export const logout = (p: IconProps) => <S {...p} d="M15 17l5-5-5-5M20 12H9M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" w={p.w || 18} />;
export const check = (p: IconProps) => <S {...p} d="M5 13l4 4L19 7" sw={2.4} />;
export const download = (p: IconProps) => <S {...p} d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" w={p.w || 16} />;
export const bolt = (p: IconProps) => <S {...p} fill="currentColor"><path d="M13 2L4.5 13.5H11l-1 8.5L19 10h-6.5z" /></S>;
export const spool = (p: IconProps) => <S {...p}><rect x="6" y="3.5" width="12" height="17" rx="2" /><path d="M6 7.5h12M6 16.5h12M9.5 7.5l5 9M14.5 7.5l-5 9" strokeWidth={1.3} /></S>;
export const target = (p: IconProps) => <S {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></S>;
export const trophy = (p: IconProps) => <S {...p} d="M7 4h10v3a5 5 0 0 1-10 0zM7 5H4.5v1.5A2.5 2.5 0 0 0 7 9M17 5h2.5v1.5A2.5 2.5 0 0 1 17 9M12 12v3M9 20h6M10 17h4l.5 3h-5z" w={p.w || 18} />;
export const eye = (p: IconProps) => <S {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></S>;
export const eyeOff = (p: IconProps) => <S {...p} d="M4 4l16 16M9.5 5.3A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.3 4M6.3 7.8A16 16 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 3.5-.7M9.8 9.9a3 3 0 0 0 4.2 4.2" />;
export const arrowUp = (p: IconProps) => <S {...p} d="M12 19V5M6 11l6-6 6 6" w={p.w || 14} sw={2.2} />;
export const pulse = (p: IconProps) => <S {...p} d="M3 12h4l2-6 4 12 2-6h6" />;

const Icons = {
  home, users, chart, doc, plus, chevDown, chevRight, chevLeft, close,
  sun, moon, search, edit, trash, user, phone, rupee, calendar, cog,
  logout, check, download, bolt, spool, target, trophy, eye, eyeOff,
  arrowUp, pulse,
};

export default Icons;
