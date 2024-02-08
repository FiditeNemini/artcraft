import { useContext } from 'react';
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';

export enum JobListAll { All }

export type JobListTypes = FrontendInferenceJobType | JobListAll;

export default function useInferenceJobs(jobType: JobListTypes) {
  const { byCategory, enqueue, inferenceJobs } = useContext(InferenceJobsContext);

  return {
    enqueue,
    inferenceJobs: jobType === JobListAll.All ? inferenceJobs : (byCategory?.get(jobType - 1) || []),
    jobStatusDescription: (jobState: JobState) => Object.keys(JobState).filter(key => isNaN(Number(key)))[jobState]
  };
};