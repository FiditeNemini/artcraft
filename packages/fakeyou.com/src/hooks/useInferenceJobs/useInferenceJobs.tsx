import { useContext } from 'react';
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';

export default function useInferenceJobs(jobType: FrontendInferenceJobType) {
  const { byCategory } = useContext(InferenceJobsContext);
  return {
    inferenceJobs: (byCategory?.get(jobType) || []),
    jobStatusDescription: (jobState: JobState) => Object.keys(JobState).filter(key => isNaN(Number(key)))[jobState]
  };
};