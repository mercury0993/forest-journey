import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function CatSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <path d="M76,74 Q92,60 88,48" fill="none" stroke="#808080" strokeWidth="6" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="58" cy="70" rx="18" ry="15" fill="#808080" />
      <ellipse cx="58" cy="64" rx="12" ry="9" fill="#b0b0b0" />
      {/* Head */}
      <ellipse cx="56" cy="44" rx="20" ry="18" fill="#808080" />
      {/* Ears — triangles */}
      <polygon points="38,32 34,14 48,28" fill="#808080" />
      <polygon points="38,30 36,18 46,28" fill="#e8c0c0" />
      <polygon points="74,32 78,14 64,28" fill="#808080" />
      <polygon points="74,30 76,18 66,28" fill="#e8c0c0" />
      {/* Cheeks */}
      <ellipse cx="40" cy="48" rx="7" ry="5" fill="#b0b0b0" />
      <ellipse cx="72" cy="48" rx="7" ry="5" fill="#b0b0b0" />
      {/* Eyes */}
      <EyesAlmond cx={56} cy={42} spacing={10} />
      {/* Nose */}
      <NoseSmall cx={56} cy={50} />
      {/* Mouth */}
      <path d="M50,54 Q56,58 62,54" fill="none" stroke="#3a1a00" strokeWidth="1" />
      {/* Whiskers */}
      <line x1="30" y1="48" x2="42" y2="50" stroke="#ccc" strokeWidth="0.5" />
      <line x1="30" y1="52" x2="42" y2="52" stroke="#ccc" strokeWidth="0.5" />
      <line x1="82" y1="48" x2="70" y2="50" stroke="#ccc" strokeWidth="0.5" />
      <line x1="82" y1="52" x2="70" y2="52" stroke="#ccc" strokeWidth="0.5" />
    </svg>
  );
}
