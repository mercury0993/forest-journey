import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function EagleSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="66" rx="18" ry="16" fill="#5a4a3a" />
      <ellipse cx="58" cy="60" rx="12" ry="9" fill="#8b7b6b" />
      {/* Wings — spread wide */}
      <path d="M40,64 Q20,50 10,54 Q24,62 38,68" fill="#4a3a2a" />
      <path d="M76,64 Q96,50 106,54 Q92,62 78,68" fill="#4a3a2a" />
      {/* Tail feathers */}
      <polygon points="50,80 44,100 56,84" fill="#4a3a2a" />
      <polygon points="58,80 58,102 62,84" fill="#3a2a1a" />
      <polygon points="66,80 72,100 60,84" fill="#4a3a2a" />
      {/* Head */}
      <ellipse cx="58" cy="44" rx="14" ry="13" fill="#5a4a3a" />
      {/* White head cap */}
      <ellipse cx="58" cy="38" rx="12" ry="8" fill="#fff" />
      {/* Eyes */}
      <circle cx="52" cy="42" r="3" fill="#f0a030" />
      <circle cx="52" cy="42" r="2" fill="#1a1a1a" />
      {/* Beak — hooked */}
      <path d="M62,44 L80,38 L76,42 L80,46" fill="#f0a030" />
      {/* Feet — talons */}
      <path d="M48,82 L44,94 M48,82 L48,94 M48,82 L52,94" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
      <path d="M68,82 L64,94 M68,82 L68,94 M68,82 L72,94" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
