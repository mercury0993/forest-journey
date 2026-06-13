import React from "react";
import EyesAlmond from "./shared/face/EyesAlmond";
import NoseSnout from "./shared/face/NoseSnout";

interface Props {
  width?: number;
  height?: number;
}

export default function LionSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Tail tuft */}
      <ellipse cx="88" cy="78" rx="8" ry="6" fill="#8b5e3c" />
      {/* Body */}
      <ellipse cx="56" cy="72" rx="20" ry="16" fill="#c08850" />
      <ellipse cx="56" cy="66" rx="14" ry="10" fill="#e8d0b0" />
      {/* Mane */}
      <ellipse cx="54" cy="42" rx="28" ry="26" fill="#c08850" />
      <ellipse cx="54" cy="42" rx="28" ry="26" fill="#8b5e3c" opacity="0.3" />
      {/* Head */}
      <ellipse cx="54" cy="42" rx="18" ry="17" fill="#d4a060" />
      {/* Ears */}
      <ellipse cx="36" cy="28" rx="6" ry="7" fill="#d4a060" />
      <ellipse cx="72" cy="28" rx="6" ry="7" fill="#d4a060" />
      {/* Cheeks */}
      <ellipse cx="40" cy="46" rx="7" ry="5.5" fill="#e8d0b0" />
      <ellipse cx="68" cy="46" rx="7" ry="5.5" fill="#e8d0b0" />
      {/* Eyes */}
      <EyesAlmond cx={54} cy={40} spacing={9} />
      {/* Nose */}
      <NoseSnout cx={54} cy={48} />
      {/* Mouth */}
      <path d="M47,52 Q54,57 61,52" fill="none" stroke="#3a1a00" strokeWidth="1.2" />
    </svg>
  );
}
