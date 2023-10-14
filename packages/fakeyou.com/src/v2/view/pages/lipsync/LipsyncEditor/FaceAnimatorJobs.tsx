import React, { useEffect, useState } from 'react';
// import { a } from '@react-spring/web';
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";
// import { springs } from "resources";
import { useInferenceJobs } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Analytics } from "common/Analytics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faHourglass1, faRemove, faTrophy, faWarning } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

export default function FaceAnimatorJobs({ t }: { t: any }) {
  const { inferenceJobs = [] } = useInferenceJobs({ type: 0 });
  const [pending, pendingSet] = useState<GetPendingTtsJobCountSuccessResponse>({
    success: true,
    pending_job_count: 0,
    cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
    refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
  });
  const mediaLink = (path: string) => new BucketConfig().getGcsUrl(path);
  const statusIcons = [faHourglass1,faHourglass1,faWarning,faRemove,faTrophy];
  const statusTxt = (which: number, config = {}) => ["animationPending","animationInProgress","animationFailed","animationDead","animationSuccess"].map((str,i) => t(`status.${str}`,config))[which];

  // const processFail = (fail = "") => {
  //   switch (fail) {
  //     case "face_not_detected": return "Face not detected, try another picture";
  //     default: return "Uknown failure";
  //   }
  // };

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

    return inferenceJobs.length ? <div {...{ className: "face-animator-jobs panel" }}>
      <h5>Your jobs</h5>
      { inferenceJobs.map((job, key) => {
      return <div {...{ className: "panel face-animator-job", key }}>
        <FontAwesomeIcon {...{ className: `job-status-icon job-status-${job.statusIndex}`, icon: statusIcons[job.statusIndex] }}/>
        <div {...{ className: "job-details" }}>
          <h6>
            { statusTxt(job.statusIndex,{ attemptCount: job.attemptCount || "" }) }
            {/*{ job.maybeFailureCategory ? `: ${ processFail(job.maybeFailureCategory) }` : "" }*/}
          </h6>
          <span {...{ className: "job-id" }}>id: { job.jobToken }</span>
        </div>
        {
          job.maybeResultToken ?  <a {...{
              className: "btn btn-primary",
              download: `fakeyou-${job.jobToken}.mp4`,
              href: mediaLink(job.maybeResultPublicBucketMediaPath || ""),
              onClick:() => Analytics.voiceConversionClickDownload()
            }}>
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              { t("inputs.downloadFile") }
            </a> : null
          }
      </div>
     }).reverse()}
    </div> : null;
};