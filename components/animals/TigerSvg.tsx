import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function TigerSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <path d="M78,74 Q96,58 94,44" fill="none" stroke="#e8783a" strokeWidth="7" strokeLinecap="round" />
      <path d="M78,74 Q96,58 94,44" fill="none" stroke="#3a1a00" strokeWidth="7" strokeLinecap="round" strokeDasharray="2,8" />
      {/* Body */}
      <ellipse cx="58" cy="70" rx="20" ry="16" fill="#e8783a" />
      <ellipse cx="58" cy="64" rx="14" ry="10" fill="#fff5e6" />
      {/* Stripes on body */}
      <path d="M44,68 L50,64" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52,72 L54,66" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62,72 L60,66" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="56" cy="44" rx="22" ry="19" fill="#e8783a" />
      {/* Ears */}
      <ellipse cx="36" cy="30" rx="7" ry="8" fill="#e8783a" />
      <ellipse cx="36" cy="30" rx="4" ry="5" fill="#fff5e6" />
      <ellipse cx="76" cy="30" rx="7" ry="8" fill="#e8783a" />
      <ellipse cx="76" cy="30" rx="4" ry="5" fill="#fff5e6" />
      {/* Forehead stripes */}
      <path d="M52,28 L56,36 L60,28" fill="none" stroke="#3a1a00" strokeWidth="2" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="38" cy="48" rx="9" ry="7" fill="#fff5e6" />
      <ellipse cx="74" cy="48" rx="9" ry="7" fill="#fff5e6" />
      {/* Eyes */}
      <EyesRound cx={56} cy={42} spacing={11} />
      {/* Nose */}
      <NoseSmall cx={56} cy={50} />
      {/* Mouth */}
      <path d="M49,54 Q56,59 63,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
