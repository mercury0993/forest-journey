import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function HorseSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="22" ry="16" fill="#8b5e3c" />
      {/* Neck */}
      <path d="M50,62 Q44,40 48,22 L62,20 Q60,40 64,62" fill="#8b5e3c" />
      {/* Head — long face */}
      <ellipse cx="54" cy="22" rx="10" ry="8" fill="#8b5e3c" />
      <ellipse cx="54" cy="28" rx="8" ry="10" fill="#8b5e3c" />
      {/* Ears */}
      <polygon points="48,16 46,4 52,14" fill="#8b5e3c" />
      <polygon points="60,16 62,4 56,14" fill="#8b5e3c" />
      <polygon points="48,15 47,6 51,14" fill="#c09870" />
      <polygon points="60,15 61,6 57,14" fill="#c09870" />
      {/* Mane */}
      <path d="M50,20 Q42,30 46,44" fill="none" stroke="#5a3a1a" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <EyesRound cx={54} cy={22} spacing={6} />
      {/* Nose */}
      <NoseSnout cx={54} cy={32} />
    </svg>
  );
}
