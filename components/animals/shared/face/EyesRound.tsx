import React from "react";

interface Props {
  cx: number;
  cy: number;
  spacing: number;
}

export default function EyesRound({ cx, cy, spacing }: Props) {
  const r = 3.5;
  return (
    <g>
      <circle cx={cx - spacing} cy={cy} r={r} fill="#3a1a00" />
      <circle cx={cx + spacing} cy={cy} r={r} fill="#3a1a00" />
      <circle cx={cx - spacing + 1} cy={cy - 1} r={1.2} fill="#fff" />
      <circle cx={cx + spacing + 1} cy={cy - 1} r={1.2} fill="#fff" />
    </g>
  );
}
