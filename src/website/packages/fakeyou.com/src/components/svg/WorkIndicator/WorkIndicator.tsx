import React from "react";
import { AniX, Check, DashedCircle } from "components/svg";
import { circle } from "../sharedSVGProps";
import "./WorkIndicator.scss";

interface Props {
  failure: boolean;
  max?: number;
  progressPercentage: number;
  stage: number;
  success: boolean;
}

export default function WorkIndicator({
  failure = false,
  max,
  progressPercentage,
  stage = 0,
  success = false,
  ...rest
}: Props) {
  return (
    <svg {...{ className: "work-indicator", ...rest }}>
      <circle {...{ ...circle, className: "work-indicator-circle-track" }} />
      <DashedCircle
        {...{
          className: "work-indicator-circle-marker",
          max,
          progressPercentage,
          stage,
        }}
      />
      <AniX {...{ checked: failure }} />
      <Check {...{ checked: success }} />
    </svg>
  );
}
