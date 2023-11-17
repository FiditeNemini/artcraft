import React, { useEffect, useState } from 'react';
// import { a } from '@react-spring/web';
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";

import { JobState } from "@storyteller/components/src/jobs/JobStates";

import { InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
// import { springs } from "resources";
// import { useInferenceJobs } from "hooks";
import { Button } from 'components/common';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHourglass1, faRemove, faTrophy, faWarning } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

interface JobsListProps{
  filter?: (job:any) => any,
  onSelect?: (e:any) => any,
  statusTxt: any,
  t: any,
  inferenceJobs?: any
}

export default function InferenceJobsList({ filter, onSelect, statusTxt, t, inferenceJobs }: JobsListProps) {
  // const { inferenceJobs = [] } = useInferenceJobs({ type: 0 });
  // const oldJobs = thejobs || inferenceJobs;
 console.log("🥬",inferenceJobs);
  const [pending, pendingSet] = useState<GetPendingTtsJobCountSuccessResponse>({
    success: true,
    pending_job_count: 0,
    cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
    refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
  });
  const statusIcons = [faHourglass1,faHourglass1,faWarning,faRemove,faTrophy];
  // const statusTxt = (which: number, config = {}) => ["animationPending","animationInProgress","animationFailed","animationDead","animationSuccess"].map((str,i) => t(`status.${str}`,config))[which];

  const processFail = (fail = "") => {
    switch (fail) {
      case "face_not_detected": return "Face not detected, try another picture";
      default: return "Uknown failure";
    }
  };

  const processStatus = (job: InferenceJob) => {
    switch (job.jobState) {
      case JobState.PENDING:
      case JobState.UNKNOWN: return 0;
      case JobState.STARTED: return 1
      case JobState.ATTEMPT_FAILED: return 2;
      case JobState.COMPLETE_FAILURE:
      case JobState.DEAD: return 3;
      case JobState.COMPLETE_SUCCESS: return 4;
      default: return -1;
    }
  };

  const jobs = inferenceJobs.map((job: InferenceJob, i: number) => ({
    ...job!,
    statusIndex: processStatus(job!)
  }));

  // const transitions = useTransition(inferenceJobs, { // not today
  //   ...springs.soft,
  //   from: { opacity: 0, position: "absolute" },
  //   enter: { opacity: 1, position: "relative" },
  //   leave: { opacity: 0, position: "absolute" },
  // });

  useEffect(() => {
    const fetch = async () => {
      const response = await GetPendingTtsJobCount();
      if (GetPendingTtsJobCountIsOk(response)) {
        if (
          response.cache_time.getTime() > pending.cache_time.getTime()
        ) {
          pendingSet(response);
        }
      }
    };
    // TODO: We're having an outage and need to lower this.
    //const interval = setInterval(async () => fetch(), 15000);
    const refreshInterval = Math.max(
      DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
      pending.refresh_interval_millis
    );
    const interval = setInterval(async () => fetch(), refreshInterval);
    fetch();
    return () => clearInterval(interval);
  }, [pending]);

    return jobs.length ? <div {...{ className: "face-animator-jobs panel" }}>
      <h5>{ t("headings.yourJobs") }</h5>
      { jobs
        // .filter(filter)
        .map((job: any, key: number) => {
        console.log("🍇",job);
      return <div {...{ className: "panel face-animator-job", key }}>
        <FontAwesomeIcon {...{ className: `job-status-icon job-status-${job.statusIndex}`, icon: statusIcons[job.statusIndex] }}/>
        <div {...{ className: "job-details" }}>
          <h4>
            { statusTxt(job.statusIndex,{ attemptCount: job.attemptCount || "" }) }
          </h4>
          <span>
            { job.maybeFailureCategory ? `${ processFail(job.maybeFailureCategory) }` : "" }
          </span>
        </div>
        {
          job.maybeResultToken ?  <Button {...{
              href: `media/${job.maybeResultToken}`,
              icon: faChevronRight,
              iconFlip: true,
              label: t("inputs.viewResult"),
              onClick: onSelect
            }} />: null
          }
      </div>
     }).reverse()}
    </div> : null;
};