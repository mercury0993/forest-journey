import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function FishSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="54" cy="58" rx="28" ry="16" fill="#e88040" />
      {/* Belly highlight */}
      <ellipse cx="56" cy="62" rx="20" ry="8" fill="#f0a860" />
      {/* Tail fin */}
      <polygon points="26,58 10,42 16,58 10,74" fill="#e06030" />
      {/* Dorsal fin */}
      <path d="M44,42 Q54,28 66,42" fill="#e06030" />
      {/* Pectoral fin */}
      <path d="M50,66 Q56,78 62,66" fill="#f0a860" />
      {/* Eye */}
      <circle cx="70" cy="54" r="6" fill="#fff" />
      <circle cx="70" cy="54" r="3.5" fill="#2a1a0a" />
      <circle cx="71" cy="53" r="1.5" fill="#fff" />
      {/* Mouth */}
      <path d="M80,58 Q84,60 80,62" fill="none" stroke="#c04020" strokeWidth="1.2" />
      {/* Scales hint */}
      <path d="M54,50 Q60,54 54,58" fill="none" stroke="#d06030" strokeWidth="0.8" opacity="0.5" />
      <path d="M60,48 Q66,52 60,56" fill="none" stroke="#d06030" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
