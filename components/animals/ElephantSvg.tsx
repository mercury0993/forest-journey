import React from "react";
import EyesRound from "./shared/face/EyesRound";

interface Props {
  width?: number;
  height?: number;
}

export default function ElephantSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — large */}
      <ellipse cx="58" cy="72" rx="24" ry="18" fill="#909090" />
      {/* Head */}
      <ellipse cx="58" cy="44" rx="20" ry="18" fill="#909090" />
      {/* Ears — big floppy */}
      <ellipse cx="36" cy="44" rx="12" ry="18" fill="#787878" transform="rotate(5,36,44)" />
      <ellipse cx="36" cy="44" rx="8" ry="13" fill="#c0a0a0" transform="rotate(5,36,44)" />
      <ellipse cx="80" cy="44" rx="12" ry="18" fill="#787878" transform="rotate(-5,80,44)" />
      <ellipse cx="80" cy="44" rx="8" ry="13" fill="#c0a0a0" transform="rotate(-5,80,44)" />
      {/* Trunk */}
      <path d="M58,54 Q58,70 52,80 Q48,86 52,80 Q56,74 60,62" fill="none" stroke="#909090" strokeWidth="8" strokeLinecap="round" />
      <path d="M58,54 Q58,70 52,80 Q48,86 52,80 Q56,74 60,62" fill="none" stroke="#787878" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      {/* Eyes */}
      <EyesRound cx={58} cy={42} spacing={8} />
      {/* Tusks */}
      <path d="M50,54 Q46,64 48,62" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66,54 Q70,64 68,62" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <rect x="42" y="84" width="8" height="12" rx="4" fill="#787878" />
      <rect x="52" y="86" width="8" height="12" rx="4" fill="#787878" />
      <rect x="62" y="86" width="8" height="12" rx="4" fill="#787878" />
      <rect x="70" y="84" width="8" height="12" rx="4" fill="#787878" />
    </svg>
  );
}
