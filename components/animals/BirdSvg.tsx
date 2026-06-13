import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function BirdSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail feathers */}
      <polygon points="56,76 48,96 58,86" fill="#4a8ad0" />
      <polygon points="58,76 58,98 62,86" fill="#3a6ab0" />
      <polygon points="60,76 68,96 60,86" fill="#4a8ad0" />
      {/* Body */}
      <ellipse cx="56" cy="64" rx="16" ry="18" fill="#4a8ad0" />
      <ellipse cx="56" cy="58" rx="12" ry="10" fill="#e8a060" />
      {/* Wing */}
      <ellipse cx="66" cy="64" rx="8" ry="14" fill="#3a6ab0" transform="rotate(10,66,64)" />
      {/* Head */}
      <circle cx="54" cy="40" r="14" fill="#4a8ad0" />
      {/* Eye white */}
      <circle cx="54" cy="38" r="5" fill="#fff" />
      <circle cx="54" cy="38" r="3" fill="#1a1a1a" />
      <circle cx="54" cy="37" r="1" fill="#fff" />
      {/* Beak */}
      <polygon points="64,40 76,42 64,44" fill="#f0a030" />
      {/* Crest */}
      <path d="M44,30 Q42,22 46,28" fill="none" stroke="#4a8ad0" strokeWidth="3" strokeLinecap="round" />
      <path d="M48,28 Q48,18 50,26" fill="none" stroke="#4a8ad0" strokeWidth="3" strokeLinecap="round" />
      <path d="M52,27 Q54,17 54,25" fill="none" stroke="#4a8ad0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
