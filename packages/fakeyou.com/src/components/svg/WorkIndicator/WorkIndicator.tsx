import React from 'react';
import { AniX, Check, DashedCircle } from 'components/svg';
import { circle } from "../sharedSVGProps";
import "./WorkIndicator.scss";

interface Props {
  failure: boolean,
  stage: number,
  success: boolean
}

export default function WorkIndicator({ failure = false, stage = 0, success = false }: Props) {
  return <svg {...{ className: "work-indicator" }}>
    <circle {...{ ...circle, className: "work-indicator-circle-track" }} />
    <DashedCircle {...{ className: "work-indicator-circle-marker", stage }}/>
    <AniX {...{ checked: failure }}/>
    <Check {...{ checked: success }}/>
  </svg>;
};