import { createContext } from 'react';
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FrontendInferenceJobType,  InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";

function initInferenceJobsByCategoryMap() : Map<FrontendInferenceJobType, InferenceJob[]> {
    let inferenceJobsByCategory = new Map();
    inferenceJobsByCategory.set(FrontendInferenceJobType.FaceAnimation, []);
    inferenceJobsByCategory.set(FrontendInferenceJobType.TextToSpeech, []);
    inferenceJobsByCategory.set(FrontendInferenceJobType.VoiceConversion, []);
    return inferenceJobsByCategory;
};

const processStatus = (job: InferenceJob) => {
    switch (job.jobState) {
      case JobState.PENDING:
      case JobState.UNKNOWN: return 0;
      case JobState.STARTED: return 1
      case JobState.ATTEMPT_FAILED: return 2;
      case JobState.COMPLETE_FAILURE:
      case JobState.DEAD: return 3;
      case JobState.COMPLETE_SUCCESS: return 4;
      default: return -1;
    }
  };

// export default createContext({
// 	byCategory: initInferenceJobsByCategoryMap(),
// 	nahmean: false
// });

export default createContext({ byCategory: initInferenceJobsByCategoryMap(), processStatus });