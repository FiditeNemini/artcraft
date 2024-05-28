import { useCallback, useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { ErrorResponse, GetJobStatusResponse } from "~/pages/PageEnigma/models";
import { JobState } from "~/pages/PageEnigma/enums";
import { ToastTypes } from "~/enums";

import { addToast } from "~/signals";
import {
  inferenceJobs,
  updateInferenceJob,
} from "~/pages/PageEnigma/signals/inferenceJobs";

import { GetInferenceJobStatus } from "./utilities";

function shouldKeepPolling(currStatus: string) {
  return currStatus === JobState.PENDING || currStatus === JobState.STARTED;
}

export const useInferenceJobManager = () => {
  useSignals();

  const pollInferenceJobs = useCallback(() => {
    if (inferenceJobs.value.length > 0) {
      inferenceJobs.value.forEach((job) => {
        if (shouldKeepPolling(job.job_status)) {
          GetInferenceJobStatus(job.job_id).then(
            (res: GetJobStatusResponse | ErrorResponse) => {
              if (res?.success) {
                console.log("inference", res);
                const response = res as GetJobStatusResponse;
                updateInferenceJob({
                  ...job,
                  job_status: response.state.status.status,
                  result: response.state.maybe_result,
                });
                return;
              }
              addToast(ToastTypes.ERROR, (res as ErrorResponse).error_reason);
            },
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      pollInferenceJobs();
    }, 2000);
    return () => {
      clearInterval(intervalTimer);
    };
  }, [pollInferenceJobs]);
};
