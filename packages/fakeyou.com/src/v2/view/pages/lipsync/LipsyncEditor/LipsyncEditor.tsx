import React, { useState } from "react";
import { animated, useTransition } from '@react-spring/web';
import { v4 as uuidv4 } from "uuid";
import { useFile } from "hooks";
import { AudioInput, ImageInput, Spinner } from "components/common";
import { springs } from "resources";
import {
  UploadAudio,
  // UploadAudioIsOk,
  // UploadAudioRequest,
} from "@storyteller/components/src/api/upload/UploadAudio";
import {
  UploadImage,
  // UploadImageIsOk,
  // UploadImageRequest,
} from "@storyteller/components/src/api/upload/UploadImage";
import {
  EnqueueFaceAnimation,
  // EnqueueFaceAnimationIsSuccess,
  // EnqueueFaceAnimationRequest,
} from "@storyteller/components/src/api/face_animation/EnqueueFaceAnimation";
// import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import FaceAnimatorTitle from './FaceAnimatorTitle';
import FaceAnimatorSuccess from './FaceAnimatorSuccess';
import './LipsyncEditor.scss';
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";


interface LipSyncProps { audioProps: any, children?: any, imageProps: any, index: number, toggle: any, style: any, enqueueInferenceJob: any, sessionSubscriptionsWrapper: any, inferenceJobsByCategory: any, };
interface EditorProps { 
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
};

const softSpring = { config: { mass: 1, tension: 80, friction: 10 } }

const InputPage = ({ audioProps, imageProps, toggle, style }: LipSyncProps )  => {

  return <animated.div {...{ className: "lipsync-editor", style }}>
  <div {...{ className: "grid-heading" }}>
    <h5>Image</h5>
  </div>
  <div {...{ className: "grid-heading" }}>
    <h5>Audio</h5>
  </div>
  <div {...{ className: "grid-square lipsync-audio" }}>
    <ImageInput {...{ ...imageProps, onRest: () => toggle.image(imageProps.file ? true : false) }}/>
  </div>
  <div {...{ className: "grid-square" }}>
    <AudioInput {...{ ...audioProps, onRest: (p:any,c:any,item:any,l:any) => {
      toggle.audio(!!audioProps.file);
    }, hideActions: true } }/>
  </div>
</animated.div>};

const workStatus = ["","Uploading Audio","Uploading Image","Starting animation",""];
// const jammy = ko => 

const Working = ({ audioProps, imageProps, index, style }: LipSyncProps ) => {
  const transitions = useTransition(index, {
    ...springs.soft,
    from: { opacity: 0, position: "absolute" },
    enter: { opacity: 1, position: "relative" },
    leave: { opacity: 0, position: "absolute" },
  });
  return <animated.div {...{ className: "lipsync-working", style }}>
    <div {...{ className: "lipsync-working-notice" }}>
      <h2 {...{ className: "working-title" }}> { transitions(({ opacity, position }, i) => {
            return <animated.span {...{ className: "working-title-text", style: { opacity, position: position as any} }}>{ workStatus[index] } ...</animated.span>;
          }) }</h2>
      <Spinner />
    </div>
  </animated.div>;
};

export default function LipsyncEditor({ enqueueInferenceJob, sessionSubscriptionsWrapper, inferenceJobsByCategory, ...rest }: EditorProps) {

  // the ready states are set by functions which run after the upload input animation is completed, which then illuminates the respective checkmark in a staggered way to draw attention to the workflow, and reduces concurrent animations

  const [imageReady,imageReadySet] = useState<boolean>(false);
  const [audioReady,audioReadySet] = useState<boolean>(false);
  const readyMedia = (m:number) => (t:boolean) => [imageReadySet,audioReadySet][m](t);
  const audioProps = useFile({}); // contains upload inout state and controls, see docs
  const imageProps = useFile({}); // contains upload inout state and controls, see docs
  const [index,indexSet] = useState<number>(0); // index  = slideshow slide position

  const makeRequest = (mode: number) => ({
      uuid_idempotency_token: uuidv4(),
      file: mode ? imageProps.file : audioProps.file,
      source: "file",
      type: mode ? "image" : "audio" 
  });

  const upImageAndMerge = async (audio: any) => ({ audio, image: await UploadImage(makeRequest(1)) });

  const submit = async () => {
    if (!audioProps.file) return false;

    indexSet(1); // set audio working page

    UploadAudio(makeRequest(0)) // start audio (0) upload
    .then(res => {
      if ("upload_token" in res) {
        indexSet(2); // set image working page
      }
      return upImageAndMerge(res); // start image (1) upload, replace with Upload(imageRequest)
    })
    .then(responses => {
      if ("upload_token" in responses.image) {
        indexSet(3); // set face animator API working page
        return EnqueueFaceAnimation({
          uuid_idempotency_token: uuidv4(),
          audio_source: {
            maybe_media_upload_token: responses.audio.upload_token,
          },
          image_source: {
            maybe_media_upload_token: responses.image.upload_token,
          },
        });
      }
    })
    .then(res => {
      if  (res && res.inference_job_token) {
        enqueueInferenceJob(
          res.inference_job_token,
          FrontendInferenceJobType.FaceAnimation
        );
        indexSet(4); // set face animator API working page
      }
    })
    .catch(e => {
      return { success : false };
    });
  };
  const page = index === 0 ? 0 : index === 4 ? 2 : 1;
  const headerProps = { audioProps, audioReady, imageProps, imageReady, indexSet, page, submit };

  const transitions = useTransition(index, {
    ...softSpring,
    from: { opacity: 0, position: "absolute" },
    enter: { opacity: 1, position: "relative" },
    leave: { opacity: 0, position: "absolute" },
  });

	return <div>
      <div {...{ className: "container" }}>
        <div {...{ className: "panel lipsync-panel" }}>
          <FaceAnimatorTitle { ...headerProps }/>
          { transitions((style, i) => {
            const Page = [InputPage,Working,FaceAnimatorSuccess][page];
            return Page ? <Page {...{ 
              audioProps,
              imageProps,
              enqueueInferenceJob,
              sessionSubscriptionsWrapper,
              inferenceJobsByCategory,
              index,
              toggle: { audio: readyMedia(1), image: readyMedia(0) },
              style 
            }}/> : <></>
          }) }
        </div>
      </div>
	</div>;
};