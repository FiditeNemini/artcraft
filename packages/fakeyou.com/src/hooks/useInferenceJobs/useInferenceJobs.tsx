import { useContext } from 'react';
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';
import { useModal } from "hooks";
import { InferenceJobsModal } from "components/modals";

export default function useInferenceJobs(jobType?: FrontendInferenceJobType, debug = false) {
  const { byCategory, enqueue, inferenceJobs, queueStats } = useContext(InferenceJobsContext);
  const { open } = useModal();
  const openJobListModal = () => open({ component: InferenceJobsModal, props: { jobType } });

  return {
    enqueue: (jobToken: string, openModal = false, jobTypeOverride?: FrontendInferenceJobType) => {
      if (openModal) { openJobListModal(); }
      enqueue(jobToken,jobTypeOverride || jobType);
    },
    inferenceJobs: jobType === undefined ? inferenceJobs : (byCategory?.get(jobType) || []),
    jobStatusDescription: (jobState: JobState) => Object.keys(JobState).filter(key => isNaN(Number(key)))[jobState],
    queueStats
  };
};