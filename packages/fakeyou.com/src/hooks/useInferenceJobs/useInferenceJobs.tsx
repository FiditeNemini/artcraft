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
    // enqueue,
    enqueue: (jobToken: string, noModalPls = false) => {
      if (!noModalPls) { openJobListModal(); }
      enqueue(jobToken,jobType);
    },
    inferenceJobs: jobType === undefined ? inferenceJobs : (byCategory?.get(jobType) || []),
    // inferenceJobs: jobType === AllInferenceJobs.All ? inferenceJobs : (byCategory?.get(jobType) || []),
    jobStatusDescription: (jobState: JobState) => Object.keys(JobState).filter(key => isNaN(Number(key)))[jobState],
    queueStats
  };
};