import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function FoxSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <ellipse cx="82" cy="82" rx="22" ry="12" fill="#e8783a" transform="rotate(-15,82,82)" />
      <ellipse cx="90" cy="80" rx="14" ry="8" fill="#fff5e6" transform="rotate(-15,90,80)" />
      {/* Body */}
      <ellipse cx="58" cy="72" rx="20" ry="16" fill="#e8783a" />
      <ellipse cx="58" cy="66" rx="14" ry="10" fill="#fff5e6" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="22" ry="18" fill="#e8783a" />
      {/* Ears */}
      <polygon points="38,32 30,12 48,26" fill="#e8783a" />
      <polygon points="38,30 34,16 46,28" fill="#fff5e6" />
      <polygon points="70,32 78,12 60,26" fill="#e8783a" />
      <polygon points="70,30 74,16 62,28" fill="#fff5e6" />
      {/* Cheeks */}
      <ellipse cx="38" cy="48" rx="8" ry="6" fill="#fff5e6" />
      <ellipse cx="70" cy="48" rx="8" ry="6" fill="#fff5e6" />
      {/* Eyes */}
      <EyesAlmond cx={54} cy={42} spacing={10} />
      {/* Nose */}
      <NoseSmall cx={54} cy={50} />
      {/* Mouth */}
      <path d="M48,54 Q54,58 60,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
