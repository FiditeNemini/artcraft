import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { useInferenceJobs } from "hooks";
import { LivePortraitDetails } from "@storyteller/components/src/api/model_inference/GetModelInferenceJobStatus";
import { GetMedia } from "@storyteller/components/src/api/media_files/GetMedia";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import moment from "moment";
import { Link } from "react-router-dom";
import LoadingSpinner from "components/common/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnUp } from "@fortawesome/pro-solid-svg-icons";

interface SessionLpInferenceResultsListProps {
  sessionSubscriptionsWrapper: any;
  onJobTokens: (
    maybeResultToken: string,
    jobToken: string,
    createdAt: Date,
    maybeLivePortraitDetails?: LivePortraitDetails
  ) => void;
  addSourceToken: (token: string) => void;
  addMotionToken: (token: string) => void;
  onJobClick: (job: InferenceJob) => void;
  onJobProgress: (progress: number | null) => void;
}

export default function SessionLpInferenceResultsList({
  sessionSubscriptionsWrapper,
  onJobTokens,
  addMotionToken,
  addSourceToken,
  onJobClick,
  onJobProgress,
}: SessionLpInferenceResultsListProps) {
  const { inferenceJobsByCategory } = useInferenceJobs();
  const hasInitialized = useRef(false);

  const lastProgressRef = useRef<{ [key: string]: number | null }>({});

  const livePortraitJobs = useMemo(() => {
    return (
      inferenceJobsByCategory.get(FrontendInferenceJobType.LivePortrait) || []
    );
  }, [inferenceJobsByCategory]);

  const lastProcessedJobToken = useRef<string | null>(null);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
    } else {
      livePortraitJobs.forEach((job: InferenceJob) => {
        if (
          job.maybeResultToken &&
          job.jobToken !== lastProcessedJobToken.current
        ) {
          const livePortraitDetails = job.maybeLivePortraitDetails;

          if (livePortraitDetails) {
            const { source_media_file_token, face_driver_media_file_token } =
              livePortraitDetails;

            addSourceToken(source_media_file_token);

            addMotionToken(face_driver_media_file_token);

            lastProcessedJobToken.current = job.jobToken;
            onJobTokens(
              job.maybeResultToken,
              job.jobToken,
              job.createdAt,
              livePortraitDetails
            );
          }
        }
      });
    }
  }, [livePortraitJobs, onJobTokens, addSourceToken, addMotionToken]);

  useEffect(() => {
    livePortraitJobs.forEach((job: InferenceJob) => {
      const currentProgress = job.progressPercentage;

      if (job.jobState === JobState.STARTED && currentProgress !== null) {
        if (lastProgressRef.current[job.jobToken] !== currentProgress) {
          onJobProgress(currentProgress);
          lastProgressRef.current[job.jobToken] = currentProgress;
        }
      }

      if (
        (job.jobState === JobState.COMPLETE_SUCCESS ||
          job.jobState === JobState.COMPLETE_FAILURE) &&
        lastProgressRef.current[job.jobToken] !== null
      ) {
        onJobProgress(null);
        lastProgressRef.current[job.jobToken] = null;
      }
    });
  }, [livePortraitJobs, onJobProgress]);

  const [mediaSrc, setMediaSrc] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchMedia = async (token: string) => {
      try {
        const response = await GetMedia(token, {});
        const publicBucketPath = response.media_file?.public_bucket_path || "";
        setMediaSrc(prev => ({ ...prev, [token]: publicBucketPath }));
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    };

    livePortraitJobs.forEach((job: InferenceJob) => {
      const token = job.maybeLivePortraitDetails?.source_media_file_token;
      if (token && !mediaSrc[token]) {
        fetchMedia(token);
      }
    });
  }, [livePortraitJobs, mediaSrc]);

  const jobStateTextMap: { [key in JobState]: string } = {
    [JobState.UNKNOWN]: "Unknown",
    [JobState.PENDING]: "Pending",
    [JobState.STARTED]: "Generating",
    [JobState.COMPLETE_SUCCESS]: "Completed",
    [JobState.COMPLETE_FAILURE]: "Completed (Failure)",
    [JobState.ATTEMPT_FAILED]: "Attempt Failed",
    [JobState.DEAD]: "Dead",
    [JobState.CANCELED_BY_USER]: "Canceled by User",
  };

  const jobContent = (
    <div>
      {livePortraitJobs.length > 0 ? (
        <div className="row g-3">
          {livePortraitJobs
            .slice(0, 4)
            .map((job: InferenceJob, key: number) => (
              <div
                key={key}
                onClick={() => {
                  onJobClick(job);
                }}
                className="col-12 col-lg-3"
              >
                <div className="lp-jobs-list">
                  <div
                    className="ratio ratio-1x1 overflow-hidden rounded"
                    style={{ width: "70px" }}
                  >
                    <img
                      src={
                        job.maybeLivePortraitDetails?.source_media_file_token
                          ? new BucketConfig().getGcsUrl(
                              mediaSrc[
                                job.maybeLivePortraitDetails
                                  .source_media_file_token
                              ] || ""
                            )
                          : ""
                      }
                      alt=""
                      className="object-fit-cover w-100 h-100 rounded"
                    />
                  </div>
                  <div className="d-flex flex-column flex-grow-1">
                    <div className="d-flex gap-2 align-items-center">
                      {(job.jobState === JobState.PENDING ||
                        job.jobState === JobState.STARTED) && (
                        <LoadingSpinner thin={true} size={14} padding={false} />
                      )}
                      <span className="fw-semibold">
                        {jobStateTextMap[job.jobState as JobState]}
                      </span>
                    </div>
                    <span className="fw-normal opacity-75 fs-7">
                      {moment(job.createdAt).fromNow()}
                    </span>
                    <div className="d-flex">
                      {job.maybeResultToken ? (
                        <Link
                          className="fs-7 d-flex align-items-center gap-1 mt-1"
                          to={`/media/${job.maybeResultToken}`}
                        >
                          More Details
                        </Link>
                      ) : (
                        <div className="fs-7 opacity-50 fw-medium mt-1">
                          {job.progressPercentage}% complete
                        </div>
                      )}
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowTurnUp}
                    className="pe-2 fs-5 opacity-75"
                  />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div
          className="lp-jobs-list no-hover d-flex align-items-center justify-content-center"
          style={{ height: "94px" }}
        >
          <span className="fw-medium opacity-75">
            Your latest live portrait generations will appear here.
          </span>
        </div>
      )}
    </div>
  );

  return <>{jobContent}</>;
}
