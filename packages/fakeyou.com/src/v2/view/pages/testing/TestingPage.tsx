import React from "react";

import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import {
  EnqueueFaceAnimation,
  EnqueueFaceAnimationIsSuccess,
  EnqueueFaceAnimationRequest,
} from "@storyteller/components/src/api/face_animation/EnqueueFaceAnimation";
import { v4 as uuidv4 } from "uuid";
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import TestUploadComponent from "./TestUploadComponent";

interface Props {
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}

function TestingPage(props: Props) {
  PosthogClient.recordPageview();
  usePrefixedDocumentTitle("Testing");

  const doTest = async () => {
    let request: EnqueueFaceAnimationRequest = {
      uuid_idempotency_token: uuidv4(),
      audio_source: {
        maybe_voice_conversion_result_token: "todo",
        //maybe_media_file_token: "audio_media_token",
      },
      image_source: {
        maybe_media_file_token: "image_media_token",
      },
    };

    let result = await EnqueueFaceAnimation(request);

    if (EnqueueFaceAnimationIsSuccess(result)) {
      props.enqueueInferenceJob(
        result.inference_job_token,
        FrontendInferenceJobType.VoiceConversion
      );
    }
  };

  return (
    <div>
      <div className="container-panel pt-4 pb-5">
        <h1>Testing Page</h1>

        <br />
        <br />

        <TestUploadComponent
          uploadTypeLabel={"Audio"}
          uploadTypesAllowed={["MP3", "WAV", "FLAC", "OGG"]}
          setMediaUploadToken={() => {}}
          formIsCleared={false}
          setFormIsCleared={() => {}}
          setCanConvert={() => {}}
          changeConvertIdempotencyToken={() => {}}
        />
        
        <br />
        <br />

        <TestUploadComponent
          uploadTypeLabel={"Image"}
          uploadTypesAllowed={["JPG", "PNG"]}
          setMediaUploadToken={() => {}}
          formIsCleared={false}
          setFormIsCleared={() => {}}
          setCanConvert={() => {}}
          changeConvertIdempotencyToken={() => {}}
        />

        <br />
        <br />

        <button onClick={() => doTest()}>Test the thing</button>
      </div>
    </div>
  );
}

export { TestingPage };
