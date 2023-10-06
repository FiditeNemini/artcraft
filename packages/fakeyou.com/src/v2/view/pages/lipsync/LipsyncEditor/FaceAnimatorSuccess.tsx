import React, { useEffect, useState } from 'react';
import { animated } from '@react-spring/web';
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { Analytics } from "common/Analytics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FaceAnimatorSlide } from "./FaceAnimatorTypes";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

export default function FaceAnimatorSuccess({ audioProps, imageProps, style, enqueueInferenceJob, sessionSubscriptionsWrapper, inferenceJobsByCategory, t }: FaceAnimatorSlide) {
  const [pending, pendingSet] = useState<GetPendingTtsJobCountSuccessResponse>({
    success: true,
    pending_job_count: 0,
    cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
    refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
  });
  const inferenceJobs = inferenceJobsByCategory.get(FrontendInferenceJobType.FaceAnimation)!;
  const mediaLink = (path: string) => new BucketConfig().getGcsUrl(path);
  const processStatus = (job: InferenceJob) => {
    switch (job.jobState) {
      case JobState.PENDING:
      case JobState.UNKNOWN: return t("status.animationPending");
      case JobState.STARTED: return t("status.animationInProgress");
      case JobState.ATTEMPT_FAILED: return t("status.animationPending",{ attemptCount: job.attemptCount });
      case JobState.COMPLETE_FAILURE:
      case JobState.DEAD: return t("status.animationDead");
      case JobState.COMPLETE_SUCCESS: return t("status.animationSuccess");
    }
  };

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

  return <animated.div {...{ className: "lipsync-success", style }}>
    <div {...{ className: "face-animator-results" }}>{
      inferenceJobs.map((job: any) => !job.maybeResultToken ? 
        <div>
          <h3>{ processStatus(job) }</h3>
          <span {...{ className: "job-id" }}>id: { job.jobToken }</span>
        </div> : <div>
          <h3>{ t("status.animationComplete") }</h3>
          <span {...{ className: "job-id" }}>id: { job.jobToken }</span>
          <a {...{
            className: "btn btn-primary w-100 mt-4",
            download: `fakeyou-${job.jobToken}.mp4`,
            href: mediaLink(job.maybeResultPublicBucketMediaPath),
            onClick:() => Analytics.voiceConversionClickDownload()
          }}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            { t("inputs.downloadFile") }
          </a>
        </div>).reverse()
    }</div>
  </animated.div>;
};