import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function DolphinSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — curved leaping shape */}
      <path d="M30,68 Q36,40 58,36 Q80,34 92,44 Q96,46 92,48 Q84,40 62,40 Q44,42 40,62 Q38,74 48,82 Q56,88 70,86 Q82,84 92,74" fill="#6088c0" />
      {/* Belly */}
      <path d="M36,66 Q42,46 58,42 Q74,40 88,46" fill="none" stroke="#a0c8e8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      {/* Dorsal fin */}
      <path d="M58,38 Q62,24 72,30" fill="#5080b0" />
      {/* Tail fluke */}
      <polygon points="30,68 14,60 18,68 14,76" fill="#5080b0" />
      {/* Pectoral fin */}
      <path d="M52,60 Q48,74 56,72" fill="#5080b0" />
      {/* Eye */}
      <circle cx="84" cy="42" r="3" fill="#1a2a3a" />
      <circle cx="85" cy="41" r="1" fill="#fff" />
      {/* Mouth — smiling arc */}
      <path d="M86,48 Q92,52 94,50" fill="none" stroke="#4060a0" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
