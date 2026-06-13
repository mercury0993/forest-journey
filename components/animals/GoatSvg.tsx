import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function GoatSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="18" ry="14" fill="#d4c8b0" />
      <ellipse cx="58" cy="66" rx="12" ry="8" fill="#e8e0d0" />
      {/* Neck */}
      <rect x="50" y="38" width="14" height="20" rx="7" fill="#d4c8b0" />
      {/* Head */}
      <ellipse cx="56" cy="36" rx="16" ry="12" fill="#d4c8b0" />
      {/* Horns — curved back */}
      <path d="M44,28 Q36,16 44,10" fill="none" stroke="#8b7b6b" strokeWidth="3" strokeLinecap="round" />
      <path d="M68,28 Q76,16 68,10" fill="none" stroke="#8b7b6b" strokeWidth="3" strokeLinecap="round" />
      {/* Ears */}
      <ellipse cx="40" cy="32" rx="5" ry="3" fill="#b8a890" transform="rotate(-15,40,32)" />
      <ellipse cx="72" cy="32" rx="5" ry="3" fill="#b8a890" transform="rotate(15,72,32)" />
      {/* Beard */}
      <path d="M52,46 L52,56" stroke="#d4c8b0" strokeWidth="3" strokeLinecap="round" />
      <path d="M56,46 L56,58" stroke="#d4c8b0" strokeWidth="3" strokeLinecap="round" />
      <path d="M60,46 L60,56" stroke="#d4c8b0" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <EyesAlmond cx={56} cy={34} spacing={8} />
      {/* Nose */}
      <NoseSmall cx={56} cy={42} />
      {/* Mouth */}
      <path d="M50,46 Q56,50 62,46" fill="none" stroke="#6b5b4b" strokeWidth="1" />
    </svg>
  );
}
