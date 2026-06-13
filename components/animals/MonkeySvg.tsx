import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function MonkeySvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail — curly */}
      <path d="M72,72 Q90,62 90,48 Q90,36 82,38" fill="none" stroke="#8b6b4b" strokeWidth="5" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="56" cy="70" rx="16" ry="15" fill="#8b6b4b" />
      <ellipse cx="56" cy="64" rx="10" ry="8" fill="#b89870" />
      {/* Head */}
      <ellipse cx="56" cy="42" rx="18" ry="17" fill="#b89870" />
      {/* Face — heart-shaped lighter area */}
      <ellipse cx="56" cy="46" rx="13" ry="12" fill="#e8d0b8" />
      {/* Ears — big round */}
      <circle cx="36" cy="36" r="8" fill="#b89870" />
      <circle cx="36" cy="36" r="5" fill="#e8c0a0" />
      <circle cx="76" cy="36" r="8" fill="#b89870" />
      <circle cx="76" cy="36" r="5" fill="#e8c0a0" />
      {/* Eyes */}
      <EyesRound cx={56} cy={42} spacing={8} />
      {/* Nose */}
      <NoseSnout cx={56} cy={50} />
      {/* Mouth — wide smile */}
      <path d="M48,54 Q56,62 64,54" fill="none" stroke="#3a2a1a" strokeWidth="1.2" />
    </svg>
  );
}
