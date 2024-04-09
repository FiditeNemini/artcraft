import Queue from  "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "../Queue/QueueNames";
import { toInferenceActions } from "../Queue/toInferenceActions";
// import * as uuid from "uuid";
// import { signal } from "@preact/signals-core";

import { InferenceJob } from "../models";

export function addInferenceJob(
  inferenceJob: InferenceJob){
  Queue.publish({
    queueName: QueueNames.TO_INFERENCE,
    action: toInferenceActions.ADD_TTS_JOB,
    data: inferenceJob,
  });
}