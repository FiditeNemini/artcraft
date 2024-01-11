import React from 'react';
import { a, useSpring } from "@react-spring/web";
import { circle } from "../sharedSVGProps";

interface Props {
  className?: string,
  stage: number
}

export default function DashedCircle({ className = "", stage = 0 }: Props) {
  const dashes = [ // the arity (amount of numbers) must remain the same or react-spring will freakout
    "1 7 1 7 1 70", // UKNOWN / PENDING - 3x 1pt strokes with 7 point gaps, then a big 70pt gap
    "6 0 6 0 6 70", // STARTED / ATTEMPT_FAILED - 6pt strokes with 0pt gaps to appear as one, big gap
    "0 0 50 0 0 0" // COMPLETE_SUCCESS / COMPLETE_FAILURE / DEAD - One big 50pt stroke
  ];
  const style = useSpring({
    config: { tension: 280, friction: 60 },
    opacity: [.5,1,1][stage],
    strokeDasharray: dashes[stage]
  });

  return <a.circle {...{ ...circle, className, style }} />;
};