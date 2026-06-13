import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function SnakeSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — S-curve */}
      <path d="M36,80 Q50,92 60,78 Q70,64 60,52 Q50,40 60,30 Q68,22 76,24" fill="none" stroke="#4a8a4a" strokeWidth="10" strokeLinecap="round" />
      {/* Belly pattern */}
      <path d="M36,80 Q50,92 60,78 Q70,64 60,52 Q50,40 60,30 Q68,22 76,24" fill="none" stroke="#6aba6a" strokeWidth="4" strokeLinecap="round" strokeDasharray="4,8" />
      {/* Head */}
      <ellipse cx="76" cy="24" rx="8" ry="6" fill="#4a8a4a" transform="rotate(-15,76,24)" />
      {/* Eyes */}
      <circle cx="78" cy="22" r="2.5" fill="#fff" />
      <circle cx="78" cy="22" r="1.5" fill="#1a1a1a" />
      <circle cx="82" cy="23" r="2.5" fill="#fff" />
      <circle cx="82" cy="23" r="1.5" fill="#1a1a1a" />
      {/* Tongue */}
      <path d="M82,27 L90,28 L92,26 M90,28 L92,30" fill="none" stroke="#e04040" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
