import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function RabbitSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="18" ry="16" fill="#e8d0c0" />
      <ellipse cx="58" cy="66" rx="12" ry="9" fill="#fff5ee" />
      {/* Head */}
      <ellipse cx="56" cy="44" rx="18" ry="17" fill="#e8d0c0" />
      {/* Long ears */}
      <ellipse cx="44" cy="18" rx="6" ry="16" fill="#e8d0c0" transform="rotate(-5,44,18)" />
      <ellipse cx="44" cy="18" rx="3.5" ry="12" fill="#f0c0c0" transform="rotate(-5,44,18)" />
      <ellipse cx="68" cy="18" rx="6" ry="16" fill="#e8d0c0" transform="rotate(5,68,18)" />
      <ellipse cx="68" cy="18" rx="3.5" ry="12" fill="#f0c0c0" transform="rotate(5,68,18)" />
      {/* Cheeks */}
      <ellipse cx="40" cy="48" rx="7" ry="5.5" fill="#fff5ee" />
      <ellipse cx="72" cy="48" rx="7" ry="5.5" fill="#fff5ee" />
      {/* Eyes */}
      <EyesRound cx={56} cy={42} spacing={9} />
      {/* Nose */}
      <NoseSmall cx={56} cy={49} />
      {/* Mouth */}
      <path d="M51,52 Q54,55 56,52 Q58,55 61,52" fill="none" stroke="#c0a090" strokeWidth="0.8" />
      {/* Tail — fluffy circle */}
      <circle cx="78" cy="78" r="8" fill="#fff5ee" />
    </svg>
  );
}
