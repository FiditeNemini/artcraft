import React, { useState } from "react";

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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import { TestPageResultList } from "./TestPageResultList";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";

interface Props {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
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

  const [audioToken, setAudioToken] = useState<string|undefined>(undefined);
  const [imageToken, setImageToken] = useState<string|undefined>(undefined);

  const doTest = async () => {
    let request: EnqueueFaceAnimationRequest = {
      uuid_idempotency_token: uuidv4(),
      audio_source: {
        //maybe_voice_conversion_result_token: "todo",
        //maybe_media_file_token: "audio_media_token",
        maybe_media_upload_token: audioToken,
      },
      image_source: {
        //maybe_media_file_token: "image_media_token",
        maybe_media_upload_token: imageToken,
      },
    };

    let result = await EnqueueFaceAnimation(request);

    if (EnqueueFaceAnimationIsSuccess(result) && result.inference_job_token) {
      props.enqueueInferenceJob(
        result.inference_job_token,
        FrontendInferenceJobType.FaceAnimation
      );
    }
  };

  const generateButtonDisabled = !!!audioToken || !!!imageToken;
  const generateButtonClass = generateButtonDisabled
    ? "btn btn-uploaded w-100 disabled"
    : "btn btn-primary w-100";

  return (
    <div>
      <div className="container-panel pt-4 pb-5">
        <h1>Testing Page</h1>

        <br />
        <br />

        <h2>Audio</h2>
        <TestUploadComponent
          uploadTypeLabel={"Audio"}
          uploadTypesAllowed={["MP3", "WAV", "FLAC", "OGG"]}
          setMediaUploadToken={(token) => { setAudioToken(token) }}
          formIsCleared={false}
          setFormIsCleared={() => {}}
          setCanConvert={() => {}}
          changeConvertIdempotencyToken={() => {}}
        />

        {audioToken ? (
          <>
          <br />
          <div>Audio upload token: {audioToken}</div>
          </>
        ) : (<></>)}
        
        <br />
        <br />

        <h2>Image</h2>
        <TestUploadComponent
          uploadTypeLabel={"Image"}
          uploadTypesAllowed={["JPG", "PNG"]}
          setMediaUploadToken={(token) => { setImageToken(token) }}
          formIsCleared={false}
          setFormIsCleared={() => {}}
          setCanConvert={() => {}}
          changeConvertIdempotencyToken={() => {}}
        />

        {imageToken ? (
          <>
          <br />
          <div>Image upload token: {imageToken}</div>
          </>
        ) : (<></>)}
        
        <br />
        <br />

        <h2>Generate Result </h2>
        <button 
          disabled={generateButtonDisabled}
          className={generateButtonClass}
          onClick={() => doTest()}>
            Test the thing
        </button>

        <br />
        <br />

        <h4 className="text-center text-lg-start">
          <FontAwesomeIcon
            icon={faBarsStaggered}
            className="me-3"
          />
          Session Results
        </h4>
        <div className="d-flex flex-column gap-3 session-tts-section session-vc-section">
          <TestPageResultList
            inferenceJobs={
              props.inferenceJobsByCategory.get(
                FrontendInferenceJobType.FaceAnimation
              )!
            }
            sessionSubscriptionsWrapper={
              props.sessionSubscriptionsWrapper
            }
          />
        </div>


      </div>
    </div>
  );
}

export { TestingPage };
