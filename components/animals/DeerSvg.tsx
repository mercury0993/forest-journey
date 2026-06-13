import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function DeerSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Body */}
      <ellipse cx="58" cy="74" rx="18" ry="15" fill="#c08850" />
      <ellipse cx="58" cy="68" rx="11" ry="8" fill="#e8d0b0" />
      {/* Neck */}
      <rect x="50" y="34" width="16" height="24" rx="8" fill="#c08850" />
      {/* Head */}
      <ellipse cx="58" cy="34" rx="14" ry="11" fill="#c08850" />
      {/* Antlers */}
      <path d="M48,26 L42,12 L46,8 L50,18 L54,6 L56,18" fill="none" stroke="#6b4b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M68,26 L74,12 L70,8 L66,18 L62,6 L60,18" fill="none" stroke="#6b4b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Ears */}
      <ellipse cx="44" cy="28" rx="5" ry="3" fill="#a06830" transform="rotate(-20,44,28)" />
      <ellipse cx="72" cy="28" rx="5" ry="3" fill="#a06830" transform="rotate(20,72,28)" />
      {/* Eyes */}
      <EyesRound cx={58} cy={33} spacing={7} />
      {/* Nose */}
      <NoseSmall cx={58} cy={39} />
      {/* Spots on body */}
      <circle cx="50" cy="72" r="2.5" fill="#e8d0b0" opacity="0.6" />
      <circle cx="60" cy="78" r="2" fill="#e8d0b0" opacity="0.6" />
      <circle cx="66" cy="70" r="3" fill="#e8d0b0" opacity="0.6" />
    </svg>
  );
}
