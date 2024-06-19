import { useContext } from "react";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from "components/providers";
import { useModal } from "hooks";
import { InferenceJobsModal } from "components/modals";

export default function useInferenceJobs(debug = false) {
  const {
    byCategory,
    clearJobs,
    clearJobsStatus,
    enqueue,
    inferenceJobs,
    queueStats,
    someJobsAreDone,
  } = useContext(InferenceJobsContext);

  const { open } = useModal();
  const openJobListModal = (jobType?: FrontendInferenceJobType) =>
    open({ component: InferenceJobsModal, props: { jobType } });

  return {
    clearJobs,
    clearJobsStatus,
    enqueue: (
      jobToken: string,
      jobTypeOverride?: FrontendInferenceJobType,
      openModal = false
    ) => {
      if (openModal) {
        openJobListModal();
      }
      enqueue(jobToken, jobTypeOverride);
    },
    enqueueInferenceJob: enqueue,
    inferenceJobs,
    inferenceJobsByCategory: byCategory,
    jobStatusDescription: (jobState: JobState) =>
      Object.keys(JobState).filter(key => isNaN(Number(key)))[jobState],
    queueStats,
    someJobsAreDone,
  };
}
