import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function ButterflySvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Upper left wing */}
      <ellipse cx="38" cy="38" rx="20" ry="16" fill="#e88060" transform="rotate(-20,38,38)" />
      <ellipse cx="40" cy="36" rx="12" ry="10" fill="#f0a880" transform="rotate(-20,40,36)" />
      <circle cx="36" cy="34" r="5" fill="#f0d060" opacity="0.6" />
      {/* Upper right wing */}
      <ellipse cx="78" cy="38" rx="20" ry="16" fill="#e88060" transform="rotate(20,78,38)" />
      <ellipse cx="76" cy="36" rx="12" ry="10" fill="#f0a880" transform="rotate(20,76,36)" />
      <circle cx="80" cy="34" r="5" fill="#f0d060" opacity="0.6" />
      {/* Lower left wing */}
      <ellipse cx="42" cy="60" rx="14" ry="12" fill="#e88060" transform="rotate(-10,42,60)" />
      <ellipse cx="44" cy="58" rx="8" ry="7" fill="#f0a880" transform="rotate(-10,44,58)" />
      {/* Lower right wing */}
      <ellipse cx="74" cy="60" rx="14" ry="12" fill="#e88060" transform="rotate(10,74,60)" />
      <ellipse cx="72" cy="58" rx="8" ry="7" fill="#f0a880" transform="rotate(10,72,58)" />
      {/* Body */}
      <ellipse cx="58" cy="52" rx="4" ry="18" fill="#4a3a2a" />
      {/* Head */}
      <circle cx="58" cy="36" r="5" fill="#4a3a2a" />
      {/* Antennae */}
      <path d="M56,32 Q48,18 44,22" fill="none" stroke="#4a3a2a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60,32 Q68,18 72,22" fill="none" stroke="#4a3a2a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="44" cy="22" r="2" fill="#e88060" />
      <circle cx="72" cy="22" r="2" fill="#e88060" />
    </svg>
  );
}
