import { signal, computed } from "@preact/signals-core";

import { JobStatus } from "~/enums";
import { Job } from "~/models";
import { isJobStatusTerminal } from "~/utilities";

export const recentJobs = signal<Job[] | undefined>([]);
export const setJobs = (newJobList: Job[]) => {
  recentJobs.value = [...newJobList];
};

export const activeJobs = computed(() => {
  if (!recentJobs.value) {
    return undefined;
  }
  return recentJobs.value.filter((job) => {
    // if job is not terminal, it's an active job
    return !isJobStatusTerminal(job.status.status);
  });
});

export const activeWorkflowJobs = computed(() => {
  if (!activeJobs.value) {
    return undefined;
  }
  return activeJobs.value.filter((job) => {
    return job.request.inference_category === "workflow";
  });
});
export const completedJobs = computed(() => {
  if (!recentJobs.value) {
    return undefined;
  }
  return recentJobs.value.filter((job) => {
    return job.status.status === JobStatus.COMPLETE_SUCCESS;
  });
});

export const shouldPollActiveJobs = signal<boolean>(true);

export const startPollingActiveJobs = () => {
  console.info("start polling Active Jobs");
  shouldPollActiveJobs.value = true;
};
export const stopPollingActiveJobs = () => {
  console.info("stop polling Active Jobs");
  shouldPollActiveJobs.value = false;
};
