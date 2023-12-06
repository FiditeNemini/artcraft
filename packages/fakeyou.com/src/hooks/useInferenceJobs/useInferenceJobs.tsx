import { useContext } from 'react';
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';

export default function useInferenceJobs(jobType: FrontendInferenceJobType) {
  const { byCategory, processStatus } = useContext(InferenceJobsContext);

  return {
    inferenceJobs: (byCategory.get(jobType) || []).map((job,i) => ({
      ...job!,
      statusIndex: processStatus(job!)
    })),
    processStatus
  };
};