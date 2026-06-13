import React from "react";

interface Props {
  cx: number;
  cy: number;
  spacing: number;
}

export default function EyesAlmond({ cx, cy, spacing }: Props) {
  return (
    <g>
      <ellipse cx={cx - spacing} cy={cy} rx={4} ry={3} fill="#3a1a00" />
      <ellipse cx={cx + spacing} cy={cy} rx={4} ry={3} fill="#3a1a00" />
      <ellipse cx={cx - spacing + 0.5} cy={cy - 1} rx={1.5} ry={1} fill="#fff" />
      <ellipse cx={cx + spacing + 0.5} cy={cy - 1} rx={1.5} ry={1} fill="#fff" />
    </g>
  );
}
