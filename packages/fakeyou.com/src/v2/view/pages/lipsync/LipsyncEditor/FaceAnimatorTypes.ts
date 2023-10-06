import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FrontendInferenceJobType,  InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";

export interface FaceAnimatorSlide {
  audioProps: any;
  children?: any;
  imageProps: any;
  frameDimensions: any;
  frameDimensionsChange: any;
  disableFaceEnhancement: any;
  disableFaceEnhancementChange: any;
  index: number;
  still: any;
  stillChange: any;
  style: any;
  toggle: any;
  enqueueInferenceJob: any;
  sessionSubscriptionsWrapper: any;
  t: any;
  inferenceJobsByCategory: any;
  removeWatermark: any;
  removeWatermarkChange: any;
}

export interface FaceAnimatorCore {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}