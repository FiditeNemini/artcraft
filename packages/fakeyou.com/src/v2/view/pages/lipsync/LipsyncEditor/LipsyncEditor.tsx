import React, { useState } from "react";
import { animated, useTransition } from "@react-spring/web";
import { v4 as uuidv4 } from "uuid";
import { useFile, useLocalize } from "hooks";
import { AudioInput, Checkbox, ImageInput, NumberSlider, Radio, Spinner } from "components/common";
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
import FaceAnimatorTitle from "./FaceAnimatorTitle";
import FaceAnimatorSuccess from "./FaceAnimatorSuccess";
import "./LipsyncEditor.scss";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";

interface LipSyncProps {
  animationChange: any;
  animationStyle: any;
  audioProps: any;
  children?: any;
  cropChange: any;
  cropping: any;
  imageProps: any;
  index: number;
  orientation: any;
  orientationChange: any;
  style: any;
  toggle: any;
  enqueueInferenceJob: any;
  sessionSubscriptionsWrapper: any;
  t: any;
  inferenceJobsByCategory: any;
  watermark: any;
  watermarkChange: any;
}
interface EditorProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}

const softSpring = { config: { mass: 1, tension: 80, friction: 10 } };

const InputPage = ({
  animationChange,
  animationStyle,
  audioProps,
  cropping,
  cropChange,
  imageProps,
  orientation,
  orientationChange,
  toggle,
  style,
  t,
  watermark,
  watermarkChange,
}: LipSyncProps) => {

  return  <animated.div {...{ className: "lipsync-editor row", style }}>
    <div {...{ className: "media-input-column col-lg-6" }}>
      <h5>{t("headings.image")}</h5>
      <ImageInput
        {...{
          ...imageProps,
          onRest: () => toggle.image(imageProps.file ? true : false),
        }}
      />
      <label {...{ class: "sub-title", }}>Watermark</label>
      <Checkbox {...{ checked: watermark, label: "Disable (premium only)", onChange: watermarkChange }}/>
      <label {...{ class: "sub-title", }}>Orientation</label>
      <Radio {...{ label: "Landscape", name: "landscape", onChange: orientationChange, value: orientation }}/>
      <Radio {...{ label: "Portait", name: "portrait", onChange: orientationChange, value: orientation }}/>
      <label {...{ class: "sub-title", }}>Cropping</label>
      <Radio {...{ label: "Cropped", name: "cropped", onChange: cropChange, value: cropping }}/>
      <Radio {...{ label: "Full size (Premium only)", name: "fullSize", onChange: cropChange, value: cropping }}/>
      <label {...{ class: "sub-title", }}>Animation style</label>
      <NumberSlider {...{ min: 0, max: 32, onChange: animationChange, value: animationStyle }}/>
    </div>
    <div {...{ className: "media-input-column col-lg-6" }}>
      <h5>{t("headings.audio")}</h5>
      <AudioInput
        {...{
          ...audioProps,
          onRest: (p: any, c: any, item: any, l: any) => {
            toggle.audio(!!audioProps.file);
          },
          hideActions: true,
        }}
      />
    </div>
  </animated.div>;
};

const Working = ({ audioProps, imageProps, index, style, t }: LipSyncProps) => {
  const workStatus = [
    "",
    t("status.uploadingAudio"),
    t("status.uploadingImage"),
    t("status.requestingAnimation"),
    "",
  ];
  const transitions = useTransition(index, {
    ...springs.soft,
    from: { opacity: 0, position: "absolute" },
    enter: { opacity: 1, position: "relative" },
    leave: { opacity: 0, position: "absolute" },
  });
  return (
    <animated.div {...{ className: "lipsync-working", style }}>
      <div {...{ className: "lipsync-working-notice" }}>
        <h2 {...{ className: "working-title" }}>
          {" "}
          {transitions(({ opacity, position }, i) => {
            return (
              <animated.span
                {...{
                  className: "working-title-text",
                  style: { opacity, position: position as any },
                }}
              >
                {workStatus[index]} ...
              </animated.span>
            );
          })}
        </h2>
        <Spinner />
      </div>
    </animated.div>
  );
};

export default function LipsyncEditor({
  enqueueInferenceJob,
  sessionSubscriptionsWrapper,
  inferenceJobsByCategory,
  ...rest
}: EditorProps) {
  const { t } = useLocalize("FaceAnimator");

  // the ready states are set by functions which run after the upload input animation is completed, which then illuminates the respective checkmark in a staggered way to draw attention to the workflow, and reduces concurrent animations

  const [imageReady, imageReadySet] = useState<boolean>(false);
  const [audioReady, audioReadySet] = useState<boolean>(false);
  const readyMedia = (m: number) => (t: boolean) =>
    [imageReadySet, audioReadySet][m](t);
  const audioProps = useFile({}); // contains upload inout state and controls, see docs
  const imageProps = useFile({}); // contains upload inout state and controls, see docs
  const [index, indexSet] = useState<number>(0); // index  = slideshow slide position


  const [animationStyle,animationStyleSet] = useState(0);
  const [cropping,croppingSet] = useState("cropped");
  const [orientation,orientationSet] = useState("landscape");
  const [watermark,watermarkSet] = useState(false);

  const animationChange = ({ target }: any) => animationStyleSet(target.value);
  const cropChange = ({ target }: any) => croppingSet(target.value);
  const orientationChange = ({ target }: any) => orientationSet(target.value);
  const watermarkChange = ({ target }: any) => watermarkSet(target.checked);
  const clearInputs = () => { animationStyleSet(0); croppingSet("cropped"); orientationSet("landscape"); watermarkSet(false);  }

  const makeRequest = (mode: number) => ({
    uuid_idempotency_token: uuidv4(),
    file: mode ? imageProps.file : audioProps.file,
    source: "file",
    type: mode ? "image" : "audio",
  });

  const upImageAndMerge = async (audio: any) => ({
    audio,
    image: await UploadImage(makeRequest(1)),
  });

  const submit = async () => {
    if (!audioProps.file) return false;

    indexSet(1); // set audio working page

    UploadAudio(makeRequest(0)) // start audio (0) upload
      .then((res) => {
        if ("upload_token" in res) {
          indexSet(2); // set image working page
        }
        return upImageAndMerge(res); // start image (1) upload, replace with Upload(imageRequest)
      })
      .then((responses) => {
        if ("upload_token" in responses.image) {
          indexSet(3); // set face animator API working page
          return EnqueueFaceAnimation({
            // backend_animation_key: animationStyle,
            // backend_cropping_key: cropping === "cropped",
            // backend_orientation_key: orientation === "landscape",
            // backend_watermark_key: watermark,
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
      .then((res) => {
        if (res && res.inference_job_token) {
          enqueueInferenceJob(
            res.inference_job_token,
            FrontendInferenceJobType.FaceAnimation
          );
          indexSet(4); // set face animator API success page
        }
      })
      .catch((e) => {
        return { success: false };
      });
  };
  const page = index === 0 ? 0 : index === 4 ? 2 : 1;
  const headerProps = {
    audioProps,
    audioReady,
    clearInputs,
    imageProps,
    imageReady,
    indexSet,
    page,
    submit,
    t,
  };

  const transitions = useTransition(index, {
    ...softSpring,
    from: { opacity: 0, position: "absolute" },
    enter: { opacity: 1, position: "relative" },
    leave: { opacity: 0, position: "absolute" },
  });

  return (
    <div {...{ className: "container-panel pt-4" }}>
      <div {...{ className: "panel lipsync-panel p-3 py-4 p-md-4" }}>
        <FaceAnimatorTitle {...headerProps} />
        {transitions((style, i) => {
          const Page = [InputPage, Working, FaceAnimatorSuccess][page];
          return Page ? (
            <Page
              {...{
                audioProps,
                animationStyle,
                animationChange,
                cropChange,
                cropping,
                enqueueInferenceJob,
                imageProps,
                orientation,
                orientationChange,
                sessionSubscriptionsWrapper,
                inferenceJobsByCategory,
                index,
                t,
                toggle: { audio: readyMedia(1), image: readyMedia(0) },
                style,
                watermark,
                watermarkChange,
              }}
            />
          ) : (
            <></>
          );
        })}
      </div>
    </div>
  );
}
