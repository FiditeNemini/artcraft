import { ErrorResponse, GetJobStatusResponse } from "~/pages/PageEnigma/models";

import { getActiveJobs, getJobStatus, getRecentJobs } from "~/api";
import { authentication } from "~/signals";

export function GetInferenceJobStatus(
  jobToken: string,
): Promise<GetJobStatusResponse | ErrorResponse> {
  const endpoint = getJobStatus(jobToken);

  return fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      session: authentication.sessionToken.value || "",
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

export function GetRecentJobs() {
  const endpoint = getRecentJobs;

  return fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      session: authentication.sessionToken.value || "",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return {
        success: false,
        error_reason: "Unknown Error in Getting Recent Jobs",
      };
    });
}

export function GetActiveJobs() {
  const endpoint = getActiveJobs;

  return fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      session: authentication.sessionToken.value || "",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return {
        success: false,
        error_reason: "Unknown error",
      };
    });
}
