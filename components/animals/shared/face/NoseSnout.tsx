import React from "react";

interface Props {
  cx: number;
  cy: number;
}

export default function NoseSnout({ cx, cy }: Props) {
  return <ellipse cx={cx} cy={cy} rx={4.5} ry={3.5} fill="#2d1b0e" />;
}
