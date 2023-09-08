import React, { useState } from "react";
import { animated, useSpring, useTransition } from '@react-spring/web';
import { useFile, useIdempotency } from "hooks";
import { AudioInput, ImageInput, Spinner } from "components/common";
import DynamicButton from './DynamicButton';
import { Upload } from "@storyteller/components/src/api/upload/upload";
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

const fakeAPI = async (anything: any) => { // this just simulates the unifinished apis
  await new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 3000);
  });
  return { success: true, inference_job_token: "fake", upload_token: "also fake", };
};

export default function LipsyncEditor({ enqueueInferenceJob, ...rest }: EditorProps) {

  // the ready states are set by functions which run after the upload input animation is completed, which then illuminates the respective checkmark in a staggered way to draw attention to the workflow, and reduces concurrent animations

  const [imageReady,imageReadySet] = useState<boolean>(false);
  const [audioReady,audioReadySet] = useState<boolean>(false);
  const readyMedia = (m:number) => (t:boolean) => [imageReadySet,audioReadySet][m](t);

  const idempotency = useIdempotency();
  const audioProps = useFile({}); // contains upload inout state and controls, see docs
  const imageProps = useFile({}); // contains upload inout state and controls, see docs
  const [index,indexSet] = useState<number>(0); // index  = slideshow slide position
  const [audioUploadToken,audioUploadTokenSet] = useState<string>();
  const [imageUploadToken,imageUploadTokenSet] = useState<string>();

  const makeRequest = (mode: number) => ({
      uuid_idempotency_token: idempotency.token,
      file: mode ? imageProps.file : audioProps.file,
      source: "file",
      type: mode ? "image" : "audio" 
  });

  const submit = async () => {
    if (!audioProps.file) return false;

    indexSet(1); // set audio working page

    Upload(makeRequest(0)) // start audio (0) upload
    .then(res => {
      if ("success" in res) {
        audioUploadTokenSet(res.upload_token); // audio token stored
        idempotency.reset(); // reset token for new request, I don't know if this needs to happen
        indexSet(2); // set image working page
      }
      return fakeAPI(makeRequest(1)); // start image (1) upload, replace with Upload(imageRequest)
    })
    .then(res => {
      if ("success" in res) {
        imageUploadTokenSet(res.upload_token); // image token stored
        idempotency.reset(); 
        indexSet(3); // set face animator API working page
      }
      return fakeAPI({ 
        source_audio_media_upload_token: audioUploadToken, 
        source_image_media_upload_token: imageUploadToken, 
        uuid_idempotency_token: idempotency.token
      });
    })
    .then(res => {
      if ("success" in res) {
      // this breaks because I don't get a real token
      // enqueueInferenceJob(res.inference_job_token,FrontendInferenceJobType.FaceAnimation);
        idempotency.reset();
        indexSet(4); // set face animator API working page
      }
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