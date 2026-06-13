import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function DogSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail */}
      <ellipse cx="80" cy="78" rx="16" ry="8" fill="#c08850" transform="rotate(-20,80,78)" />
      {/* Body */}
      <ellipse cx="58" cy="72" rx="20" ry="16" fill="#c08850" />
      <ellipse cx="58" cy="66" rx="14" ry="10" fill="#e8d0b0" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="20" ry="19" fill="#c08850" />
      {/* Floppy ears */}
      <ellipse cx="32" cy="40" rx="8" ry="14" fill="#a06830" transform="rotate(10,32,40)" />
      <ellipse cx="76" cy="40" rx="8" ry="14" fill="#a06830" transform="rotate(-10,76,40)" />
      {/* Snout */}
      <ellipse cx="54" cy="50" rx="10" ry="7" fill="#e8d0b0" />
      {/* Eyes */}
      <EyesRound cx={54} cy={40} spacing={9} />
      {/* Nose */}
      <NoseSnout cx={54} cy={48} />
      {/* Mouth */}
      <path d="M46,54 Q54,60 62,54" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
      <path d="M54,48 L54,60" fill="none" stroke="#3a1a00" strokeWidth="0.8" />
    </svg>
  );
}
