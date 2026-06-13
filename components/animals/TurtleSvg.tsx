import React from "react";
import EyesRound from "./shared/face/EyesRound";

interface Props {
  width?: number;
  height?: number;
}

export default function TurtleSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Shell */}
      <ellipse cx="58" cy="66" rx="26" ry="18" fill="#5a8a3a" />
      <ellipse cx="58" cy="64" rx="22" ry="14" fill="#7aba4a" />
      {/* Shell pattern */}
      <path d="M40,62 L58,52 L76,62" fill="none" stroke="#5a8a3a" strokeWidth="1.5" />
      <path d="M40,62 L58,72 L76,62" fill="none" stroke="#5a8a3a" strokeWidth="1.5" />
      <path d="M44,58 L58,68 L44,68" fill="none" stroke="#5a8a3a" strokeWidth="1" />
      <path d="M72,58 L58,68 L72,68" fill="none" stroke="#5a8a3a" strokeWidth="1" />
      {/* Head */}
      <ellipse cx="84" cy="60" rx="10" ry="8" fill="#8ac860" />
      {/* Neck */}
      <ellipse cx="76" cy="62" rx="6" ry="6" fill="#8ac860" />
      {/* Eyes */}
      <EyesRound cx={84} cy={58} spacing={5} />
      {/* Mouth */}
      <path d="M90,62 Q92,64 90,65" fill="none" stroke="#3a5a1a" strokeWidth="0.8" />
      {/* Legs */}
      <ellipse cx="42" cy="72" rx="7" ry="5" fill="#8ac860" />
      <ellipse cx="74" cy="78" rx="7" ry="5" fill="#8ac860" />
      <ellipse cx="40" cy="58" rx="6" ry="5" fill="#8ac860" />
      <ellipse cx="76" cy="52" rx="6" ry="5" fill="#8ac860" />
      {/* Tail */}
      <polygon points="34,60 24,56 34,64" fill="#8ac860" />
    </svg>
  );
}
