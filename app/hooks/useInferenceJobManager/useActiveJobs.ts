import { useEffect } from "react";
import { useSignalEffect, useSignals } from "@preact/signals-react/runtime";

import { GetJobsResponse } from "./types";
import { ToastTypes } from "~/enums";
import { SEVEN_SECONDS } from "~/constants";

import {
  activeJobs,
  addToast,
  setJobs,
  shouldPollActiveJobs,
  startPollingActiveJobs,
  stopPollingActiveJobs,
} from "~/signals";

import { GetRecentJobs } from "./utilities";

export const useActiveJobs = () => {
  useSignals();

  useEffect(() => {
    const PollRecentJobs = () => {
      GetRecentJobs().then((res: GetJobsResponse) => {
        if (!res.success) {
          addToast(
            ToastTypes.ERROR,
            res.error_message || "Unknown Error in Getting Recent Jobs",
          );
        }
        if (res.jobs && res.jobs.length > 0) {
          setJobs(res.jobs);
        }
        // just no jobs, not an error, do nothing
      });
    };

    // Initial Poll
    PollRecentJobs();

    //trigger the pull every two seconds
    const intervalTimer = setInterval(() => {
      if (shouldPollActiveJobs.value) {
        //but only do it if necessary
        PollRecentJobs();
      }
    }, SEVEN_SECONDS);
    return () => {
      clearInterval(intervalTimer);
    };
  }, []);

  useSignalEffect(() => {
    // if active jobs is not initiated, do nothing
    if (!activeJobs.value) {
      return;
    }
    // if there are no active jobs, stop making polls
    if (activeJobs.value.length === 0) {
      stopPollingActiveJobs();
      return;
    }
    // if there are active jobs, and is not polling, start polling
    if (activeJobs.value.length > 0 && !shouldPollActiveJobs.value) {
      startPollingActiveJobs();
    }
  });
};
