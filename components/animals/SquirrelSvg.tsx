import React from "react";
import EyesRound from "./shared/face/EyesRound";
import NoseSmall from "./shared/face/NoseSmall";

interface Props {
  width?: number;
  height?: number;
}

export default function SquirrelSvg({ width = 96, height = 96 }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      {/* Big bushy tail */}
      <path d="M72,74 Q98,60 94,38 Q92,56 82,68" fill="#c08040" />
      <path d="M74,72 Q92,58 90,42 Q88,54 80,66" fill="#e8c090" />
      {/* Body */}
      <ellipse cx="56" cy="68" rx="16" ry="14" fill="#c08040" />
      <ellipse cx="56" cy="62" rx="10" ry="8" fill="#e8c090" />
      {/* Head */}
      <ellipse cx="54" cy="44" rx="15" ry="14" fill="#c08040" />
      {/* Ears */}
      <ellipse cx="42" cy="32" rx="5" ry="6" fill="#c08040" />
      <ellipse cx="42" cy="32" rx="3" ry="4" fill="#e8c090" />
      <ellipse cx="66" cy="32" rx="5" ry="6" fill="#c08040" />
      <ellipse cx="66" cy="32" rx="3" ry="4" fill="#e8c090" />
      {/* Cheeks */}
      <ellipse cx="40" cy="46" rx="6" ry="5" fill="#e8c090" />
      <ellipse cx="68" cy="46" rx="6" ry="5" fill="#e8c090" />
      {/* Eyes */}
      <EyesRound cx={54} cy={42} spacing={8} />
      {/* Nose */}
      <NoseSmall cx={54} cy={49} />
      {/* Mouth */}
      <path d="M49,52 Q54,55 59,52" fill="none" stroke="#6b4b30" strokeWidth="0.8" />
      {/* Acorn in paws */}
      <ellipse cx="44" cy="62" rx="4" ry="5" fill="#8b6b30" />
      <rect x="42" y="56" width="4" height="3" rx="1" fill="#6b4b1a" />
    </svg>
  );
}
