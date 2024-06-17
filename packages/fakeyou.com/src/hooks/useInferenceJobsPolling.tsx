import { useEffect, useState } from "react";
import {
  JobsBySession,
  JobsBySessionResponse,
} from "@storyteller/components/src/api/jobs/JobsBySession";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { jobStateCanChange } from "@storyteller/components/src/jobs/JobStates";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  GetJobStatus,
  GetJobStatusResponse,
} from "@storyteller/components/src/api/model_inference/GetJobStatus";
import { useInterval } from "hooks";

export type CategoryMap = Map<FrontendInferenceJobType, InferenceJob[]>;

const JobCategoryToType = (jobCategory: string) => {
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
  sessionWrapper: SessionWrapper;
}

const newJobCategoryMap = (): CategoryMap => {
  let inferenceJobsByCategory = new Map();
  Object.keys(FrontendInferenceJobType)
    .filter(key => !isNaN(Number(key))) // remove string keys
    .forEach(key => inferenceJobsByCategory.set(Number(key), []));

  return inferenceJobsByCategory;
};

export default function useInferenceJobsPolling({
  debug,
  sessionWrapper,
}: JobsPollingProps) {
  const { user } = sessionWrapper?.sessionStateResponse || { user: null };

  const [inferenceJobs, inferenceJobsSet] = useState<InferenceJob[]>();
  const [byCategory, byCategorySet] = useState(newJobCategoryMap());
  const [initialized, initializedSet] = useState(false);

  // this boolean when set to true starts a useInterval loop, when false it runs clearInterval on that loop
  // this is to prevent memory leaks, and to update params provided to useInterval's onTick event.
  const [keepAlive, keepAliveSet] = useState(!!user);

  // if this interval value is state set by the server response, useInterval will adjust accordingly
  const interval = 2500;

  // this is to acccomodate async session loading
  useEffect(() => {
    if (!initialized && user && !keepAlive) {
      initializedSet(true);
      keepAliveSet(true);
    }
  }, [initialized, keepAlive, user]);

  if (debug) console.log("☠️ keepAlive", keepAlive, inferenceJobs, byCategory);

  const updateCategoryMap = (
    categoryMap: CategoryMap,
    updatedJob: InferenceJob,
    frontendJobType: FrontendInferenceJobType
  ) => {
    categoryMap.set(frontendJobType, [
      ...(categoryMap.get(frontendJobType) || []),
      updatedJob,
    ]);
  };

  const updateState = (
    updatedJobs: InferenceJob[],
    categoryMap: CategoryMap
  ) => {
    inferenceJobsSet(updatedJobs);
    byCategorySet(categoryMap);
    if (!updatedJobs.some(job => jobStateCanChange(job.jobState))) {
      keepAliveSet(false);
    }
  };

  const sessionJobs = () =>
    JobsBySession("", {}).then((res: JobsBySessionResponse) => {
      if (res && res.jobs) {
        let categoryMap = new Map(newJobCategoryMap());
        const updatedJobs = res.jobs.map((job, i) => {
          const frontendJobType = JobCategoryToType(
            job.request.inference_category
          );

          const updatedJob = InferenceJob.fromResponse(job, frontendJobType);

          updateCategoryMap(categoryMap, updatedJob, frontendJobType);

          return updatedJob;
        });

        updateState(updatedJobs, categoryMap);
      }
    });

  const noSessionJobs = async (currentQueue: InferenceJob[]) => {
    let categoryMap = new Map(newJobCategoryMap());
    const updatedJobs = await Promise.all(
      currentQueue.map(async (job: InferenceJob) => {
        return GetJobStatus(job.jobToken, {}).then(
          (res: GetJobStatusResponse) => {
            const updatedJob = InferenceJob.fromResponse(
              res.state!,
              job.frontendJobType
            );
            updateCategoryMap(categoryMap, updatedJob, job.frontendJobType);
            return updatedJob;
          }
        );
      })
    );

    updateState(updatedJobs, categoryMap);
  };

  const onTick = async ({
    eventProps: { inferenceJobs: currentQueue },
  }: {
    eventProps: { inferenceJobs: InferenceJob[] };
  }) => {
    if (user) {
      sessionJobs();
    } else if (inferenceJobs && inferenceJobs.length) {
      noSessionJobs(currentQueue);
    }
  };

  const enqueueInferenceJob = (
    jobToken: string,
    frontendJobType: FrontendInferenceJobType
  ) => {
    onTick({ eventProps: { inferenceJobs: [] } });
    if (user) {
      // reserving this space for later uses
    } else {
      keepAliveSet(false);
      const newJob = new InferenceJob(jobToken, frontendJobType);
      inferenceJobsSet([newJob, ...(inferenceJobs || [])]);
    }

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
