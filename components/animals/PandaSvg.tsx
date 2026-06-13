import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function PandaSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="74" rx="22" ry="19" fill="#fff" />
      <ellipse cx="58" cy="66" rx="15" ry="10" fill="#fff" />
      {/* Head */}
      <ellipse cx="56" cy="42" rx="24" ry="20" fill="#fff" />
      {/* Ears */}
      <circle cx="36" cy="26" r="8" fill="#2d2d2d" />
      <circle cx="76" cy="26" r="8" fill="#2d2d2d" />
      {/* Eye patches */}
      <ellipse cx="44" cy="40" rx="8" ry="7" fill="#2d2d2d" transform="rotate(-10,44,40)" />
      <ellipse cx="68" cy="40" rx="8" ry="7" fill="#2d2d2d" transform="rotate(10,68,40)" />
      {/* Eyes (white on dark patch) */}
      <circle cx="44" cy="40" r="3.5" fill="#fff" />
      <circle cx="68" cy="40" r="3.5" fill="#fff" />
      <circle cx="44" cy="40" r="2" fill="#1a1a1a" />
      <circle cx="68" cy="40" r="2" fill="#1a1a1a" />
      {/* Snout */}
      <ellipse cx="56" cy="50" rx="10" ry="7" fill="#e8e8e8" />
      {/* Nose */}
      <NoseSnout cx={56} cy={48} />
      {/* Mouth */}
      <path d="M50,53 Q56,57 62,53" fill="none" stroke="#1a1a1a" strokeWidth="1.2" />
    </svg>
  );
}
