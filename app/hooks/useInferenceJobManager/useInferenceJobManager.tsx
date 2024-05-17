import { useCallback, useContext, useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import {
  ActiveJob,
  ErrorResponse,
  GetJobStatusResponse,
} from "~/pages/PageEnigma/models";
import { JobState, MediaFileType } from "~/pages/PageEnigma/enums";
import { ToastTypes } from "~/enums";

import { authentication, addToast } from "~/signals";
import {
  inferenceJobs,
  updateInferenceJob,
} from "~/pages/PageEnigma/signals/inferenceJobs";
import { activeJobs, movies } from "~/pages/PageEnigma/signals";

import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";

export async function GetInferenceJobStatus(
  jobToken: string,
): Promise<GetJobStatusResponse | ErrorResponse> {
  const endpoint = `https://api.fakeyou.com/v1/model_inference/job_status/${jobToken}`;

  return await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      const response: GetJobStatusResponse | ErrorResponse = res;
      return response;
    })
    .catch(() => {
      return {
        success: false,
        error_reason: "Unknown error",
      };
    });
}

export function GetActiveJobs() {
  const endpoint =
    "https://api.fakeyou.com/v1/jobs/session?exclude_states=complete_success,dead";

  fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      session: authentication.sessionToken.value || "",
    },
    // credentials: 'include',
  })
    .then((res) => res.json())
    .then((res) => {
      const jobs = res.jobs.filter(
        (job: ActiveJob) => job.request.inference_category === "workflow",
      );
      if (JSON.stringify(activeJobs.value) !== JSON.stringify({ jobs })) {
        activeJobs.value = { jobs };
      }
    })
    .catch(() => {
      return {
        success: false,
        error_reason: "Unknown error",
      };
    });
}

export function GetCompletedMovies(username?: string) {
  if (!username) {
    return;
  }
  GetMediaByUser(
    username,
    {},
    {
      filter_media_type: MediaFileType.Video,
    },
  )
    .then((res: GetMediaListResponse) => {
      if (res.success && res.results) {
        if (
          JSON.stringify(movies.value) !==
          JSON.stringify({ movies: res.results })
        ) {
          // console.log("movies", res.results);
          movies.value = { movies: res.results };
        }
      }
    })
    .catch(() => {
      return {
        success: false,
        error_reason: "Unknown error",
      };
    });
}

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

  const pollActiveJobs = useCallback(() => {
    if (authentication.sessionToken.value) GetActiveJobs();
  }, [authentication.sessionToken.value]);

  const pollMovies = useCallback(() => {
    GetCompletedMovies(authentication.userInfo.value?.username);
  }, [authentication.userInfo.value]);

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      pollInferenceJobs();
      pollActiveJobs();
      pollMovies();
    }, 2000);
    return () => {
      clearInterval(intervalTimer);
    };
  }, [pollInferenceJobs, pollActiveJobs, pollMovies]);
};
