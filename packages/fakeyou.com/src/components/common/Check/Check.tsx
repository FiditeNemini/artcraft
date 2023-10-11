import React from 'react';
import { a, useSpring } from "@react-spring/web";

interface Props {
  checked?: boolean;
}

export default function Check({ checked }: Props) {
  const style = useSpring({
    config: { tension: 280, friction: 60 },
    strokeDasharray: checked ? '28, 0' : '0,28'
  });
  return <a.polyline {...{
    fill: "none",
    points: "9.5 18 14.5 22 22.5 12",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "4",
    strokeDashoffset: 4,
    // ...rest,
    style
  }}/>;
};