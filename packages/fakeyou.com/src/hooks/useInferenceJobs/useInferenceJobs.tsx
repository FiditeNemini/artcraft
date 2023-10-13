import { useContext } from 'react';
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';


interface Props {
  inferenceJobsByCategory?: any;
  type: number;
}

export default function useInferenceJobs({ inferenceJobsByCategory, type }: Props) {
  const { byCategory, processStatus } = useContext(InferenceJobsContext);
  const jbs = byCategory.get(FrontendInferenceJobType.FaceAnimation) || [];

  return {
    inferenceJobs: jbs.map((job,i) => ({
      ...job!,
      statusIndex: processStatus(job!)
    })),
    processStatus
  };
};