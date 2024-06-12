import { useState } from "react";
import {
  JobsBySession,
  JobsBySessionResponse,
} from "@storyteller/components/src/api/jobs/JobsBySession";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { jobStateCanChange } from "@storyteller/components/src/jobs/JobStates";
import { useInterval } from "hooks";

const JobCategoryToType = (jobCategory: string) => {
  console.log("⚙️", jobCategory);
  switch (jobCategory) {
    case "lipsync_animation":
      return FrontendInferenceJobType.FaceAnimation;
    case "text_to_speech":
      return FrontendInferenceJobType.TextToSpeech;
    case "voice_conversion":
      return FrontendInferenceJobType.VoiceConversion;
    case "image_generation":
      return FrontendInferenceJobType.ImageGeneration;
    case "mocap":
      return FrontendInferenceJobType.VideoMotionCapture;
    case "workflow":
      return FrontendInferenceJobType.VideoWorkflow;
    case "format_conversion":
      return FrontendInferenceJobType.ConvertFbxtoGltf;
    case "convert_bvh_to_workflow":
      return FrontendInferenceJobType.EngineComposition;
    default:
      return FrontendInferenceJobType.TextToSpeech;
  }
};

export interface JobsPollingProps {
  debug?: boolean;
}

const newJobCategoryMap = (): Map<FrontendInferenceJobType, InferenceJob[]> => {
  let inferenceJobsByCategory = new Map();
  Object.keys(FrontendInferenceJobType)
    .filter(key => !isNaN(Number(key)))
    .forEach(key => inferenceJobsByCategory.set(Number(key), []));

  return inferenceJobsByCategory;
};

export default function useInferenceJobsPolling({ debug }: JobsPollingProps) {
  const [inferenceJobs, inferenceJobsSet] = useState<InferenceJob[]>();
  const [byCategory, byCategorySet] = useState(newJobCategoryMap());
  // const [initialized, initializedSet] = useState(false);
  const [keepAlive, keepAliveSet] = useState(true);

  const interval = 2500;

  if (debug) console.log("☠️ keepAlive", keepAlive, inferenceJobs, byCategory);

  const onTick = ({
    eventProps: { inferenceJobs: currentQueue },
  }: {
    eventProps: { inferenceJobs: JobsBySessionResponse };
  }) => {
    JobsBySession("", {}).then((res: JobsBySessionResponse) => {
      if (res && res.jobs) {
        let newMap = new Map(newJobCategoryMap());
        const updatedJobs = res.jobs.map((job, i) => {
          const frontendJobType = JobCategoryToType(
            job.request.inference_category
          );

          const remappedJob = InferenceJob.fromResponse(job, frontendJobType);

          newMap.set(frontendJobType, [
            ...(newMap.get(frontendJobType) || []),
            remappedJob,
          ]);

          return remappedJob;
        });

        inferenceJobsSet(updatedJobs);
        byCategorySet(newMap);
        if (!updatedJobs.some(job => jobStateCanChange(job.jobState))) {
          keepAliveSet(false);
        }
      }
    });
  };

  const enqueueInferenceJob = (
    jobToken: string,
    frontendJobType: FrontendInferenceJobType
  ) => {
    keepAliveSet(true);
  };

  useInterval({
    eventProps: { inferenceJobs },
    interval,
    onTick,
    locked: !keepAlive,
  });

  return {
    byCategory,
    inferenceJobsByCategory: byCategory,
    enqueueInferenceJob,
    inferenceJobs,
  };
}
