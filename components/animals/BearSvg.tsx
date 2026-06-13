import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function BearSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body — big and round */}
      <ellipse cx="58" cy="74" rx="24" ry="20" fill="#8b5e3c" />
      <ellipse cx="58" cy="66" rx="16" ry="11" fill="#c09870" />
      {/* Head */}
      <ellipse cx="56" cy="42" rx="24" ry="20" fill="#8b5e3c" />
      {/* Ears — small round */}
      <circle cx="36" cy="26" r="8" fill="#8b5e3c" />
      <circle cx="36" cy="26" r="4.5" fill="#c09870" />
      <circle cx="76" cy="26" r="8" fill="#8b5e3c" />
      <circle cx="76" cy="26" r="4.5" fill="#c09870" />
      {/* Snout */}
      <ellipse cx="56" cy="48" rx="11" ry="8" fill="#c09870" />
      {/* Eyes */}
      <EyesRound cx={56} cy={40} spacing={10} />
      {/* Nose */}
      <NoseSnout cx={56} cy={46} />
      {/* Mouth */}
      <path d="M49,52 Q56,57 63,52" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
