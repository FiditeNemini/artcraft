import React, { useEffect, useMemo, useRef } from "react";
import { InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { useInferenceJobs } from "hooks";
import { Panel } from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/pro-solid-svg-icons";

interface SessionLpInferenceResultsListProps {
  sessionSubscriptionsWrapper: any;
  onJobTokens: (maybeResultToken: string, jobToken: string) => void;
}

export default function SessionLpInferenceResultsList({
  sessionSubscriptionsWrapper,
  onJobTokens,
}: SessionLpInferenceResultsListProps) {
  const { inferenceJobsByCategory } = useInferenceJobs();
  const hasInitialized = useRef(false);

  const livePortraitJobs = useMemo(() => {
    return inferenceJobsByCategory.get(0) || [];
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
          lastProcessedJobToken.current = job.jobToken;
          onJobTokens(job.maybeResultToken, job.jobToken);
        }
      });
    }
  }, [livePortraitJobs, onJobTokens]);

  const jobContent = (
    <div>
      {livePortraitJobs.length > 0 ? (
        <div>
          {livePortraitJobs.map((job: InferenceJob, key: number) => (
            <div
              key={key}
              onClick={() => {
                if (job.maybeResultToken) {
                  onJobTokens(job.maybeResultToken, job.jobToken);
                }
              }}
            >
              {job.maybeResultToken}
              {job.jobToken}
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column p-4 gap-3 text-center align-items-center justify-content-center">
          <FontAwesomeIcon icon={faClipboardList} className="display-6 mb-2" />
          <div>
            <h4 className="fw-semibold mb-1">title</h4>
            <p className="opacity-75 mb-2">subtitle</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Panel className="fy-session-lp-inference-jobs-list rounded" padding={true}>
      {jobContent}
    </Panel>
  );
}
