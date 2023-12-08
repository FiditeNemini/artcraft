import React, { useState } from 'react';
import { a, useSpring } from "@react-spring/web";
import { Button, Check } from 'components/common';
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { JobState } from "@storyteller/components/src/jobs/JobStates";

interface JobListItem extends InferenceJob {
  jobType: FrontendInferenceJobType,
  jobStatusDescription?: any,
  onSelect?: any
  t?: any
}

const AniX = ({ checked = false }) => {
  const sharedStyle = {
    config: { tension: 280, friction: 45 },
    strokeDashoffset: 1,
    strokeDasharray: checked ? '13, 0' : '0,13'
  };
  const line1 = useSpring({
    ...sharedStyle,
  });
  const line2 = useSpring({
    delay: 450,
    ...sharedStyle
  });

  return <>
    <a.line {...{ style: line1, x1: 14, y1: 14, x2: 22, y2: 22 }}/>
    <a.line {...{ style: line2, x1: 22, y1: 14, x2: 14, y2: 22 }}/>
  </>;
}

export default function JobItem({ maybeFailureCategory, maybeResultToken, onSelect, jobState, jobStatusDescription, jobType: inputType, t }: JobListItem) {
  console.log("👅",jobState);
  const processFail = (fail = "") => {
    switch (fail) {
      case "face_not_detected": return "Face not detected, try another picture";
      default: return "Uknown failure";
    }
  };
  const jobType = FrontendInferenceJobType[inputType];
  const jobStatus = jobStatusDescription(jobState);
	const jobStatusClass = jobStatus.toLowerCase().replace("_","-");
  const circle = { cx: 18, cy: 18, r: 14, strokeWidth: 4 };

  const dashStatus = () => {
    switch (jobState) {
      case JobState.COMPLETE_SUCCESS:
      case JobState.COMPLETE_FAILURE:
      case JobState.DEAD: return 2;
      case JobState.STARTED:
      case JobState.ATTEMPT_FAILED: return 1;
      case JobState.PENDING:
      case JobState.UNKNOWN:
      default: return 0;
    }
  }

  const [yada,yadaSet] = useState(0);
  const dashes = [ // the arity (amount of numbers) must remain the same or react-spring will freakout
    "1 7 1 7 1 70", // UKNOWN / PENDING - 3x 1pt strokes with 7 point gaps, then a big 70pt gap
    "6 0 6 0 6 70", // STARTED / ATTEMPT_FAILED - 6pt strokes with 0pt gaps to appear as one, big gap
    "0 0 50 0 0 0" // COMPLETE_SUCCESS / COMPLETE_FAILURE / DEAD - One big 50pt stroke
  ];

  const dashy = useSpring({
    config: { tension: 280, friction: 60 },
    opacity: [.5,1,1][dashStatus()],
    strokeDasharray: dashes[dashStatus()]
  });

  return <div {...{ className: `face-animator-job job-status-${jobStatusClass}` }}>
    <svg {...{ }}>
      <circle {...{ ...circle, className: "work-indicator-circle-track",}} />
      <a.circle {...{ ...circle, className: "work-indicator-circle-marker", style: dashy }} />
      <AniX checked={jobState === 4 || jobState === 6}/>
      <Check checked={jobState === 3}/>
    </svg>
    <div {...{ className: "job-details" }}>
      <h6>
        { t(`${jobType}.${jobStatus}`) }
      </h6>
      <span>
        { maybeFailureCategory ?`${ processFail(maybeFailureCategory) }` : t(`subtitles.${jobStatus}`) }
      </span>
    </div>
    {
      maybeResultToken ?  <Button {...{
          href: `media/${maybeResultToken}`,
          // icon: faChevronRight,
          iconFlip: true,
          // label: t("inputs.viewResult"),
          onClick: onSelect
        }} />: null
      }
  </div>;
};