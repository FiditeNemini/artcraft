import { useContext } from 'react';
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';
import { useModal } from "hooks";
import { InferenceJobsModal } from "components/modals";

export enum JobListAll { All }

export type JobListTypes = FrontendInferenceJobType | JobListAll;

export default function useInferenceJobs(jobType: JobListTypes, debug = false) {
  const { byCategory, enqueue, inferenceJobs } = useContext(InferenceJobsContext);
  const { open } = useModal();
  const openJobListModal = () => open({ component: InferenceJobsModal, props: { jobType } });

  return {
    // enqueue,
    enqueue: (jobToken: string) => {
      openJobListModal();
      enqueue(jobToken,jobType);
    },
    inferenceJobs: jobType === JobListAll.All ? inferenceJobs : (byCategory?.get(jobType - 1) || []),
    jobStatusDescription: (jobState: JobState) => Object.keys(JobState).filter(key => isNaN(Number(key)))[jobState]
  };
};