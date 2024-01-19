import React, { useEffect, useState } from 'react';
import { a, useSpring } from "@react-spring/web";
import { Check } from 'components/common';
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { JobState } from "@storyteller/components/src/jobs/JobStates";

// import { useInterval } from "hooks"; // for animation debugging

interface JobListItem extends InferenceJob {
  failures: (fail: string) => string,
  jobType: FrontendInferenceJobType,
  jobStatusDescription?: any,
  onSelect?: any,
  refSet?: any,
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

const OuterItem = ({ className, children, isComplete, jobToken, maybeResultToken, onSelect = () => {}, refSet }: { className?: string, children?: any, jobToken: string, isComplete: boolean, maybeResultToken?: any, onSelect?: any, refSet?: any }) => isComplete ?
  <a.a {...{ className, href: `/media/${maybeResultToken}`, id: `ijobitem-${ jobToken }`, onClick: () => onSelect(),  ref: refSet }}>{ children }</a.a> :
  <a.div {...{ className, id: `ijobitem-${ jobToken }`, ref: refSet }}>{ children }</a.div>;

export default function JobItem({ failures, maybeFailureCategory, maybeResultToken, onSelect, jobToken, jobState, jobStatusDescription, jobType: inputType, refSet, t, ...rest }: JobListItem) {
  const [hasBounced,hasBouncedSet] = useState(false);

  // const [jobState,jobStateSet] = useState(0); // for animation debugging
  // useInterval({ interval: 3000, onTick: ({ index }: { index: number }) => { jobStateSet(index); if (!index) hasBouncedSet(false) } });

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
  };
  const isComplete = jobState === JobState.COMPLETE_SUCCESS;
  const isProblemo = jobState === JobState.COMPLETE_FAILURE || jobState === JobState.DEAD;
  const dashes = [ // the arity (amount of numbers) must remain the same or react-spring will freakout
    "1 7 1 7 1 70", // UKNOWN / PENDING - 3x 1pt strokes with 7 point gaps, then a big 70pt gap
    "6 0 6 0 6 70", // STARTED / ATTEMPT_FAILED - 6pt strokes with 0pt gaps to appear as one, big gap
    "0 0 50 0 0 0" // COMPLETE_SUCCESS / COMPLETE_FAILURE / DEAD - One big 50pt stroke
  ];
  const [bounce,bounceSet] = useState(false);
  const dashy = useSpring({
    config: { tension: 280, friction: 60 },
    opacity: [.5,1,1][dashStatus()],
    strokeDasharray: dashes[dashStatus()]
  });
  const makeBounce = (amount = 0, delay = 0) => ({
    delay,
    config: { tension: 250, friction: 12 },
    transform: `translate(${ bounce ? amount : 0 }px)`
  });
  const headingBounce = useSpring(makeBounce(8));
  const subtitleBounce = useSpring(makeBounce(6,30));
  const subtitle = maybeFailureCategory ?`${ failures(maybeFailureCategory) }` : t(`subtitles.${jobStatus}`);
  const className = `face-animator-job job-status-${jobStatusClass}`;


  useEffect(() => {
    if (!bounce && !hasBounced && isComplete) {
      hasBouncedSet(true);
      bounceSet(true);
      setTimeout(() => bounceSet(false),250);
    }
  },[bounce, hasBounced, isComplete ]);

  return <OuterItem {...{ className, isComplete, jobToken, maybeResultToken, onSelect, refSet }}>
    <svg {...{ }}>
      <circle {...{ ...circle, className: "work-indicator-circle-track" }} />
      <a.circle {...{ ...circle, className: "work-indicator-circle-marker", style: dashy }} />
      <AniX checked={isProblemo}/>
      <Check checked={isComplete}/>
    </svg>
    <div {...{ className: "job-details" }}>
      <a.h6 {...{  style: headingBounce }}>
        { t(`${jobType}.${jobStatus}`) }
      </a.h6>
      <a.p>Token: {jobToken}</a.p>
      <a.span {...{ style: subtitleBounce }}>{ isComplete ? subtitle + " >" : subtitle }</a.span>
    </div>
  </OuterItem>;
};