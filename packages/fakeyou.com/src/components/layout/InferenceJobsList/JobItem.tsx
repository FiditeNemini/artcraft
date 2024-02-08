import React, { useEffect, useState } from 'react';
import { a, useSpring } from "@react-spring/web";
import { WorkIndicator } from 'components/svg';
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { JobState } from "@storyteller/components/src/jobs/JobStates";

// import { useInterval } from "hooks"; // for animation debugging

interface JobListItem extends InferenceJob {
  failures: (fail: string) => string,
  jobStatusDescription?: any,
  onSelect?: any,
  refSet?: any,
  t?: any
}


const OuterItem = ({ className, children, success, jobToken, maybeResultToken, onSelect = () => {}, refSet }: { className?: string, children?: any, jobToken: string, success: boolean, maybeResultToken?: any, onSelect?: any, refSet?: any }) => success ?
  <a.a {...{ className, href: `/media/${maybeResultToken}`, id: `ijobitem-${ jobToken }`, onClick: () => onSelect(),  ref: refSet }}>{ children }</a.a> :
  <a.div {...{ className, id: `ijobitem-${ jobToken }`, ref: refSet }}>{ children }</a.div>;

export default function JobItem({ failures, frontendJobType, maybeFailureCategory, maybeResultToken, onSelect, jobToken, jobState, jobStatusDescription, refSet, t, ...rest }: JobListItem) {
  const [hasBounced,hasBouncedSet] = useState(false);

  // const [jobState,jobStateSet] = useState(0); // for animation debugging
  // useInterval({ interval: 3000, onTick: ({ index }: { index: number }) => { jobStateSet(index); if (!index) hasBouncedSet(false) } });

  const jobType = FrontendInferenceJobType[frontendJobType];
  const jobStatus = jobStatusDescription(jobState);
	const jobStatusClass = jobStatus.toLowerCase().replace("_","-");
  
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
  const success = jobState === JobState.COMPLETE_SUCCESS;
  const failure = jobState === JobState.COMPLETE_FAILURE || jobState === JobState.DEAD;
  const [bounce,bounceSet] = useState(false);

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
    if (!bounce && !hasBounced && success) {
      hasBouncedSet(true);
      bounceSet(true);
      setTimeout(() => bounceSet(false),250);
    }
  },[bounce, hasBounced, success ]);

  return <OuterItem {...{ className, jobToken, maybeResultToken, onSelect, refSet, success }}>
    <WorkIndicator {...{ failure, stage: dashStatus(), success }}/>
    <div {...{ className: "job-details" }}>
      <a.h6 {...{  style: headingBounce }}>
        { t(`${jobType}.${jobStatus}`) }
      </a.h6>
      <a.span {...{ style: subtitleBounce }}>{ success ? subtitle + " >" : subtitle }</a.span>
    </div>
  </OuterItem>;
};