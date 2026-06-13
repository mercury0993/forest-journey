import React from "react";

interface Props {
  cx: number;
  cy: number;
}

export default function NoseSmall({ cx, cy }: Props) {
  return <ellipse cx={cx} cy={cy} rx={3} ry={2.5} fill="#3a1a00" />;
}
