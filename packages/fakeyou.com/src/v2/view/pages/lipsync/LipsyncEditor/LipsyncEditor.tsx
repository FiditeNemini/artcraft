import React, { useState } from "react";
import { animated, useSpring, useTransition } from '@react-spring/web';
import { v4 as uuidv4 } from "uuid";
import { useFile } from "hooks";
import { AudioInput, ImageInput, Spinner } from "components/common";
import DynamicButton from './DynamicButton';
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
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import './LipsyncEditor.scss';

interface LipSyncProps { audioProps: any, children?: any, imageProps: any, toggle: any, style: any };
interface EditorProps { enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void };

const softSpring = { config: { mass: 1, tension: 80, friction: 10 } }

const SuccessPage = ({ audioProps, imageProps, style }: LipSyncProps )  => <animated.div {...{ className: "lipsync-success", style }}>
  <h3 className=" fw-bold text-center text-lg-start">
    Result
  </h3>
  Your animation is in progress.
</animated.div>;

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

const Working = ({ audioProps, children = "", imageProps, style }: LipSyncProps ) => <animated.div {...{ className: "lipsync-working", style }}>
  <div {...{ className: "lipsync-working-notice" }}>
    <h2>{ children }</h2>
    <Spinner />
  </div>
</animated.div>;

const AudioWorking = (props: any) => <Working { ...props }>Uploading Audio ...</Working>;
const ImageWorking = (props: any) => <Working { ...props }>Uploading Image ...</Working>;
const AniWorking = (props: any) => <Working { ...props }>Starting animation ...</Working>;

const ProgressLi = ({ children, disabled = false }: { children?: any, disabled?: boolean }) => {
  const style = useSpring({
    ...softSpring,
    opacity: disabled ? .25 : 1
  });
  return <animated.li {...{ style }}>
    <svg>
      <circle {...{ cx: 16, cy: 16, r: 15, strokeWidth: "2", }}/>
      { <polyline {...{
        fill: "none",
        points: "9.5 18 14.5 22 22.5 12",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "4",
      }}/> }
    </svg>
    { children }
  </animated.li>
};

const Title = ({ ...rest }) => {
  const { audioProps, audioReady, imageProps, imageReady, index, submit } = rest;
  const noAudio = !audioReady || !audioProps.file;
  const noImg = !imageReady || !imageProps.file;
  const incomplete = noAudio || noImg;
  const working = imageProps.working && audioProps.working;

  const slides = ["Generate",<Spinner />,<Spinner />,<Spinner />,"Make another"];

  const onClick = () => {
    if (imageProps.success && audioProps.success) {
      imageProps.clear(); audioProps.clear();
    } else if (!incomplete && !working) submit();
  };

  return <div {...{ className: "progress-header" }}>
    <h1 {...{ className: "fw-bold text-center text-md-start progress-heading" }}>
      Lip Service
    </h1>
    <ul {...{ className: 'async-progress-tracker' }}>
      <ProgressLi {...{ disabled: noImg }}>
        Image
      </ProgressLi>
      <ProgressLi {...{ disabled: noAudio }}>
        Audio
      </ProgressLi>
    </ul>
    <DynamicButton {...{ disabled: incomplete || working, onClick, slides, index }}/>
    <p {...{ className: "progress-description" }}> 
      Select and image with a clear face, and an audio sample, and generate a lipsynced video.
    </p>
  </div>
};

export default function LipsyncEditor({ enqueueInferenceJob, ...rest }: EditorProps) {

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
      console.log("🌅",responses);
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
      console.log("🎆",res);
      // if ("success" in res) {
      //   console.log("💒",res);
      //   indexSet(4); // set face animator API working page
      // }
    })
    .catch(e => {
      return { success : false };
    });
  };

  const headerProps = { audioProps, audioReady, imageProps, imageReady, index, submit };

  const transitions = useTransition(index, {
    ...softSpring,
    from: { opacity: 0, position: "absolute" },
    enter: { opacity: 1, position: "relative" },
    leave: { opacity: 0, position: "absolute" },
  });

	return <div>
      <div {...{ className: "container" }}>
        <div {...{ className: "panel lipsync-panel" }}>
          <Title { ...headerProps }/>
          { transitions((style, i) => {
            const Page = [InputPage,AudioWorking,ImageWorking,AniWorking,SuccessPage][i];
            return Page ? <Page {...{ 
              audioProps,
              imageProps,
              toggle: { audio: readyMedia(1), image: readyMedia(0) },
              style 
            }}/> : <></>
          }) }
        </div>
      </div>
	</div>;
};