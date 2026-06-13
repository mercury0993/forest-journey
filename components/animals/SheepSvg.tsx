import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function SheepSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — fluffy cloud shape */}
      <circle cx="46" cy="72" r="14" fill="#f5f0e8" />
      <circle cx="58" cy="68" r="16" fill="#f5f0e8" />
      <circle cx="70" cy="72" r="14" fill="#f5f0e8" />
      <circle cx="52" cy="78" r="13" fill="#f5f0e8" />
      <circle cx="64" cy="78" r="13" fill="#f5f0e8" />
      {/* Legs */}
      <rect x="44" y="82" width="5" height="14" rx="2.5" fill="#8b7b6b" />
      <rect x="54" y="84" width="5" height="12" rx="2.5" fill="#8b7b6b" />
      <rect x="62" y="84" width="5" height="12" rx="2.5" fill="#8b7b6b" />
      <rect x="68" y="82" width="5" height="14" rx="2.5" fill="#8b7b6b" />
      {/* Head */}
      <ellipse cx="52" cy="44" rx="14" ry="12" fill="#3a3a3a" />
      {/* Fluffy head wool */}
      <circle cx="44" cy="38" r="9" fill="#f5f0e8" />
      <circle cx="52" cy="36" r="10" fill="#f5f0e8" />
      <circle cx="60" cy="38" r="9" fill="#f5f0e8" />
      {/* Ears — floppy */}
      <ellipse cx="36" cy="44" rx="6" ry="10" fill="#3a3a3a" transform="rotate(15,36,44)" />
      <ellipse cx="68" cy="44" rx="6" ry="10" fill="#3a3a3a" transform="rotate(-15,68,44)" />
      {/* Eyes */}
      <EyesRound cx={52} cy={42} spacing={7} />
      {/* Nose */}
      <NoseSmall cx={52} cy={50} />
      {/* Mouth */}
      <path d="M47,53 Q52,56 57,53" fill="none" stroke="#f5f0e8" strokeWidth="0.8" />
    </svg>
  );
}
