import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function WolfSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <ellipse cx="82" cy="80" rx="20" ry="10" fill="#6b6b7b" transform="rotate(-10,82,80)" />
      {/* Body */}
      <ellipse cx="58" cy="72" rx="20" ry="16" fill="#6b6b7b" />
      <ellipse cx="58" cy="66" rx="14" ry="10" fill="#9b9bab" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="22" ry="18" fill="#6b6b7b" />
      {/* Ears — pointed upright */}
      <polygon points="38,32 32,10 48,28" fill="#6b6b7b" />
      <polygon points="38,30 36,14 46,28" fill="#9b9bab" />
      <polygon points="70,32 76,10 60,28" fill="#6b6b7b" />
      <polygon points="70,30 72,14 62,28" fill="#9b9bab" />
      {/* Cheeks */}
      <ellipse cx="38" cy="48" rx="7" ry="5.5" fill="#9b9bab" />
      <ellipse cx="70" cy="48" rx="7" ry="5.5" fill="#9b9bab" />
      {/* Eyes */}
      <EyesAlmond cx={54} cy={42} spacing={9} />
      {/* Nose */}
      <NoseSmall cx={54} cy={50} />
      {/* Mouth */}
      <path d="M47,54 Q54,59 61,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
