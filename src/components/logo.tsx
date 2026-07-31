"use client";

import React from "react";

/**
 * Official Masscorn Paradise Beach Resort crest.
 * Faithful vector recreation of the resort's gold heraldic emblem:
 * crown, twin palms, scallop shell with globe insignia, "MASSCORN" ribbon,
 * "PARADISE BEACH RESORT" subtitle, five stars and an oval filigree frame.
 */
export function LogoMark({ className = "h-16 w-[3.2rem]" }: { className?: string }) {
  const uid = React.useId().replace(/[:]/g, "");
  const gold = `url(#gold-${uid})`;
  const goldV = `url(#goldv-${uid})`;
  const ribbon = `url(#ribbon-${uid})`;

  return (
    <svg viewBox="0 0 240 300" className={className} role="img" aria-label="Masscorn Paradise Beach Resort crest">
      <defs>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdf3cf" />
          <stop offset="22%" stopColor="#f3da8c" />
          <stop offset="45%" stopColor="#d9ad5a" />
          <stop offset="60%" stopColor="#b5863c" />
          <stop offset="80%" stopColor="#e8cd82" />
          <stop offset="100%" stopColor="#8f6a2e" />
        </linearGradient>
        <linearGradient id={`goldv-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf3cf" />
          <stop offset="40%" stopColor="#e3bd6c" />
          <stop offset="70%" stopColor="#b5863c" />
          <stop offset="100%" stopColor="#7c5a26" />
        </linearGradient>
        <linearGradient id={`ribbon-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf3cf" />
          <stop offset="18%" stopColor="#eecf8e" />
          <stop offset="42%" stopColor="#c69a4e" />
          <stop offset="55%" stopColor="#9a7130" />
          <stop offset="70%" stopColor="#e3bd6c" />
          <stop offset="100%" stopColor="#8f6a2e" />
        </linearGradient>
      </defs>

      {/* ---------------------------------- crown --------------------------------- */}
      <g transform="translate(120,26)">
        <path
          d="M-26,20 L-29,-6 L-15,5 L0,-20 L15,5 L29,-6 L26,20 Z"
          fill={gold} stroke="#7c5a26" strokeWidth="0.8"
        />
        <rect x="-26" y="18" width="52" height="6" rx="1.5" fill={goldV} stroke="#7c5a26" strokeWidth="0.6" />
        <circle cx="-29" cy="-8" r="3.2" fill={goldV} stroke="#7c5a26" strokeWidth="0.6" />
        <circle cx="0" cy="-23" r="3.8" fill={goldV} stroke="#7c5a26" strokeWidth="0.6" />
        <circle cx="29" cy="-8" r="3.2" fill={goldV} stroke="#7c5a26" strokeWidth="0.6" />
        <path d="M0,-19 L0,-14" stroke="#7c5a26" strokeWidth="1" />
      </g>

      {/* ------------------------------- palms — left ------------------------------ */}
      <g transform="translate(58,96)" fill="none" stroke={gold} strokeWidth="2.6" strokeLinecap="round">
        <path d="M4,60 C6,38 8,20 10,4" />
        <path d="M10,4 C-8,-4 -22,-2 -34,-12" strokeWidth="2.2" />
        <path d="M10,4 C-4,4 -18,8 -30,4" strokeWidth="2.2" />
        <path d="M10,4 C2,-10 -2,-20 -12,-28" strokeWidth="2.2" />
        <path d="M10,4 C10,-12 12,-22 8,-34" strokeWidth="2.2" />
        <path d="M10,4 C16,-8 24,-14 36,-14" strokeWidth="2.2" />
        <path d="M10,4 C18,2 28,4 38,10" strokeWidth="2.2" />
      </g>
      {/* ------------------------------ palms — right ------------------------------ */}
      <g transform="translate(182,96) scale(-1,1)" fill="none" stroke={gold} strokeWidth="2.6" strokeLinecap="round">
        <path d="M4,60 C6,38 8,20 10,4" />
        <path d="M10,4 C-8,-4 -22,-2 -34,-12" strokeWidth="2.2" />
        <path d="M10,4 C-4,4 -18,8 -30,4" strokeWidth="2.2" />
        <path d="M10,4 C2,-10 -2,-20 -12,-28" strokeWidth="2.2" />
        <path d="M10,4 C10,-12 12,-22 8,-34" strokeWidth="2.2" />
        <path d="M10,4 C16,-8 24,-14 36,-14" strokeWidth="2.2" />
        <path d="M10,4 C18,2 28,4 38,10" strokeWidth="2.2" />
      </g>

      {/* --------------------------- connecting scrollwork -------------------------- */}
      <g fill="none" stroke={gold} strokeWidth="1.4" strokeLinecap="round">
        <path d="M74,86 C90,78 104,80 112,92" />
        <path d="M166,86 C150,78 136,80 128,92" />
        <path d="M60,150 C78,158 92,156 100,146 C104,140 100,134 94,136 C90,138 90,142 94,144" />
        <path d="M180,150 C162,158 148,156 140,146 C136,140 140,134 146,136 C150,138 150,142 146,144" />
      </g>

      {/* ------------------------------ shell emblem -------------------------------- */}
      <g transform="translate(120,118)">
        <path
          d="M0,-32 C19,-27 30,-10 30,12 C30,12 15,22 0,36 C-15,22 -30,12 -30,12 C-30,-10 -19,-27 0,-32 Z"
          fill={goldV} stroke="#7c5a26" strokeWidth="1"
        />
        <g stroke="#0c2a2c" strokeWidth="1.2" opacity="0.7" fill="none">
          <path d="M0,-27 L0,32" />
          <path d="M-11,-20 C-13,-3 -13,14 -7,26" />
          <path d="M11,-20 C13,-3 13,14 7,26" />
          <path d="M-21,-7 C-22,5 -19,15 -14,23" />
          <path d="M21,-7 C22,5 19,15 14,23" />
        </g>
        {/* globe insignia */}
        <g transform="translate(-9,-19)">
          <circle r="9" fill="#1a1a1a" stroke={gold} strokeWidth="1.3" />
          <g stroke={gold} strokeWidth="0.8" fill="none" opacity="0.9">
            <ellipse rx="9" ry="3.2" />
            <ellipse rx="9" ry="3.2" transform="rotate(60)" />
            <ellipse rx="9" ry="3.2" transform="rotate(120)" />
          </g>
        </g>
      </g>

      {/* ------------------------------- ribbon banner ------------------------------- */}
      <g transform="translate(120,196)">
        <path
          d="M-92,-17 L92,-17 L104,0 L92,17 L-92,17 L-104,0 Z"
          fill={ribbon} stroke="#7c5a26" strokeWidth="1.2"
        />
        <path d="M-92,-17 L-104,0 L-92,17" fill="none" stroke="#7c5a26" strokeWidth="1" opacity="0.6" />
        <path d="M92,-17 L104,0 L92,17" fill="none" stroke="#7c5a26" strokeWidth="1" opacity="0.6" />
        <text
          x="0" y="7" textAnchor="middle"
          fontFamily="var(--font-cormorant), Georgia, serif"
          fontSize="26" letterSpacing="3" fill="#3a2a0f" fontWeight="700"
        >
          MASSCORN
        </text>
      </g>

      {/* -------------------------------- subtitle ---------------------------------- */}
      <text
        x="120" y="228" textAnchor="middle"
        fontFamily="var(--font-jost), sans-serif"
        fontSize="9" letterSpacing="2.6" fill={goldV} fontWeight="600"
      >
        PARADISE BEACH RESORT
      </text>

      {/* ----------------------------------- stars ---------------------------------- */}
      <g fill={goldV} stroke="none">
        {[-48, -24, 0, 24, 48].map((dx) => (
          <path
            key={dx}
            transform={`translate(${120 + dx},246) scale(0.42)`}
            d="M0,-10 L2.9,-3.1 L10,-3.1 L4.3,1.3 L6.5,8.1 L0,4 L-6.5,8.1 L-4.3,1.3 L-10,-3.1 L-2.9,-3.1 Z"
          />
        ))}
      </g>

      {/* ------------------------------ oval filigree frame -------------------------- */}
      <g fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round">
        <path d="M-60,258 C-84,266 -100,278 -104,292" />
        <path d="M60,258 C84,266 100,278 104,292" />
        <path d="M-104,292 C-96,300 -84,302 -76,297" />
        <path d="M104,292 C96,300 84,302 76,297" />
        <path d="M-76,297 C-70,293 -66,286 -68,280" />
        <path d="M76,297 C70,293 66,286 68,280" />
      </g>

      {/* --------------------------------- bottom finial ------------------------------ */}
      <g transform="translate(120,270)">
        <path d="M-40,0 C-24,10 -10,10 0,4 C10,10 24,10 40,0" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M0,4 L0,16" stroke={gold} strokeWidth="1.5" />
        <path d="M-6,16 L0,28 L6,16 Z" fill={goldV} stroke="#7c5a26" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

export function Logo({ className = "", markClassName = "h-12 w-12", stacked = true, dark = true }: {
  className?: string; markClassName?: string; stacked?: boolean; dark?: boolean;
}) {
  if (!stacked) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LogoMark className={markClassName} />
        <div className="flex flex-col leading-none">
          <span className={`font-display tracking-[0.24em] ${dark ? "text-ivory" : "text-ink"}`}>MASSCORN</span>
          <span className="mt-1 text-[9px] tracking-[0.42em] text-gold">PARADISE BEACH RESORT</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoMark className={markClassName} />
    </div>
  );
}
