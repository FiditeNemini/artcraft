import { useEffect, useCallback, useContext } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  inferenceJobs,
  updateInferenceJob,
} from "~/pages/PageEnigma/store/inferenceJobs";
import {
  ActiveJob,
  ErrorResponse,
  GetJobStatusResponse,
  JobState,
} from "~/pages/PageEnigma/models";
import { ToasterContext } from "~/contexts/ToasterContext";
import { activeJobs, movies } from "~/pages/PageEnigma/store";
import { listMediaByUser } from "~/api";
import { AuthenticationContext } from "~/contexts/Authentication";
import { STORAGE_KEYS } from "~/contexts/Authentication/types";

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
  const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || "";

  fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      session: sessionToken,
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
  const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || "";
  fetch(
    listMediaByUser(username) +
      "?" +
      new URLSearchParams({ filter_media_type: "video" }),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        session: sessionToken,
      },
      // credentials: 'include'
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success && res.results) {
        if (
          JSON.stringify(movies.value) !==
          JSON.stringify({ movies: res.results })
        ) {
          console.log("movies", res.results);
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
  const { addToast } = useContext(ToasterContext);
  const { authState } = useContext(AuthenticationContext);

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
              addToast("error", (res as ErrorResponse).error_reason);
            },
          );
        }
      });
    }
  }, [addToast]);

  const pollActiveJobs = useCallback(() => {
    GetActiveJobs();
  }, []);

  const pollMovies = useCallback(() => {
    GetCompletedMovies(authState.userInfo?.username);
  }, [authState.userInfo]);

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
