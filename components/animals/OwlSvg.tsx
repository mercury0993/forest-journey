import React from "react";

interface Props {
  width?: number;
  height?: number;
}

export default function OwlSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="66" rx="20" ry="22" fill="#8b6b4b" />
      {/* Belly feathers */}
      <ellipse cx="58" cy="70" rx="14" ry="14" fill="#c0a880" />
      <path d="M48,62 L58,78 L68,62" fill="none" stroke="#a08860" strokeWidth="1" />
      <path d="M52,60 L58,72 L64,60" fill="none" stroke="#a08860" strokeWidth="1" />
      {/* Wings */}
      <ellipse cx="40" cy="66" rx="8" ry="16" fill="#6b4b2b" transform="rotate(5,40,66)" />
      <ellipse cx="76" cy="66" rx="8" ry="16" fill="#6b4b2b" transform="rotate(-5,76,66)" />
      {/* Head */}
      <ellipse cx="58" cy="40" rx="22" ry="18" fill="#8b6b4b" />
      {/* Ear tufts */}
      <polygon points="40,26 36,8 46,22" fill="#8b6b4b" />
      <polygon points="76,26 80,8 70,22" fill="#8b6b4b" />
      {/* Facial disc */}
      <ellipse cx="58" cy="42" rx="16" ry="14" fill="#c0a880" />
      {/* Eye rings */}
      <circle cx="48" cy="40" r="8" fill="#fff" />
      <circle cx="68" cy="40" r="8" fill="#fff" />
      <circle cx="48" cy="40" r="4" fill="#f0a030" />
      <circle cx="68" cy="40" r="4" fill="#f0a030" />
      <circle cx="48" cy="40" r="2.5" fill="#1a1a1a" />
      <circle cx="68" cy="40" r="2.5" fill="#1a1a1a" />
      {/* Beak */}
      <polygon points="56,46 60,46 58,52" fill="#f0a030" />
      {/* Feet */}
      <path d="M48,86 L44,96 M48,86 L48,96 M48,86 L52,96" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
      <path d="M68,86 L64,96 M68,86 L68,96 M68,86 L72,96" stroke="#f0a030" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
