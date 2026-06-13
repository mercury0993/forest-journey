import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function CowSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="72" rx="22" ry="16" fill="#fff" />
      {/* Black patches */}
      <ellipse cx="50" cy="68" rx="7" ry="6" fill="#2d2d2d" />
      <ellipse cx="68" cy="76" rx="6" ry="5" fill="#2d2d2d" />
      {/* Neck */}
      <rect x="50" y="38" width="16" height="22" rx="8" fill="#fff" />
      {/* Head */}
      <ellipse cx="58" cy="38" rx="16" ry="13" fill="#fff" />
      {/* Black head patch */}
      <ellipse cx="58" cy="34" rx="8" ry="6" fill="#2d2d2d" />
      {/* Ears */}
      <ellipse cx="42" cy="34" rx="6" ry="4" fill="#fff" />
      <ellipse cx="42" cy="34" rx="4" ry="2.5" fill="#e8c0c0" />
      <ellipse cx="74" cy="34" rx="6" ry="4" fill="#fff" />
      <ellipse cx="74" cy="34" rx="4" ry="2.5" fill="#e8c0c0" />
      {/* Horns */}
      <path d="M44,28 L40,18" stroke="#e8d0b0" strokeWidth="3" strokeLinecap="round" />
      <path d="M72,28 L76,18" stroke="#e8d0b0" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <EyesRound cx={58} cy={38} spacing={8} />
      {/* Snout — pink */}
      <ellipse cx="58" cy="48" rx="10" ry="7" fill="#e8c0c0" />
      {/* Nose */}
      <NoseSnout cx={58} cy={46} />
    </svg>
  );
}
