import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTransition } from "@react-spring/web";
import { v4 as uuidv4 } from "uuid";
import { useFile, useLocalize, useMedia } from "hooks";
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
import FaceAnimatorTitle from "./FaceAnimatorTitle";
import FaceAnimatorInput from "./FaceAnimatorInput";
import FaceAnimatorWorking from "./FaceAnimatorWorking";
import FaceAnimatorSuccess from "./FaceAnimatorSuccess";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FaceAnimatorCore } from "./FaceAnimatorTypes";
import { BasicVideo } from "components/common";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { Analytics } from "common/Analytics";
import "./FaceAnimator.scss";

export default function FaceAnimator({ enqueueInferenceJob,  sessionSubscriptionsWrapper,  inferenceJobs,  inferenceJobsByCategory, ...rest }: FaceAnimatorCore) {
  const { mediaToken } = useParams<{ mediaToken: string }>();
  const [presetAudio] = useMedia({ mediaToken });
  const { t } = useLocalize("FaceAnimator");
  usePrefixedDocumentTitle("AI Face Animator");

  // the ready states are set by functions which run after the upload input animation is completed, which then illuminates the respective checkmark in a staggered way to draw attention to the workflow, and reduces concurrent animations

  const [imageReady, imageReadySet] = useState<boolean>(false);
  const [audioReady, audioReadySet] = useState<boolean>(false);
  const readyMedia = (m: number) => (t: boolean) => [imageReadySet, audioReadySet][m](t);
  const audioProps = useFile({}); // contains upload inout state and controls, see docs
  const imageProps = useFile({}); // contains upload inout state and controls, see docs
  const [index, indexSet] = useState<number>(0); // index  = slideshow slide position

  //const [animationStyle,animationStyleSet] = useState(0);
  const [frameDimensions, frameDimensionsSet] = useState("twitter_square");
  const [removeWatermark, removeWatermarkSet] = useState(false);
  const [disableFaceEnhancement, disableFaceEnhancementSet] = useState(false);
  const [still, stillSet] = useState(false);

  const [preferPresetAudio,preferPresetAudioSet] = useState(!!mediaToken); 

  //const animationChange = ({ target }: any) => animationStyleSet(target.value);
  const frameDimensionsChange = ({ target }: any) => frameDimensionsSet(target.value);
  const removeWatermarkChange = ({ target }: any) => removeWatermarkSet(target.checked);
  const disableFaceEnhancementChange = ({ target }: any) => disableFaceEnhancementSet(target.checked);
  const stillChange = ({ target }: any) => stillSet(target.checked);
  const clearInputs = () => {
    //animationStyleSet(0);
    stillSet(false);
    frameDimensionsSet("twitter_square");
    removeWatermarkSet(false);
    disableFaceEnhancementSet(false);
  };

  const makeRequest = (mode: number) => ({
    uuid_idempotency_token: uuidv4(),
    file: mode ? imageProps.file : audioProps.file,
    source: "file",
    type: mode ? "image" : "audio",
  });

  const upImageAndMerge = async (audio: any) => ({  audio, image: await UploadImage(makeRequest(1)) });

  const MergeAndEnque = (res: any) => upImageAndMerge(res)
    .then((responses) => {
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
        make_still: still,
        disable_face_enhancement: disableFaceEnhancement,
        remove_watermark: removeWatermark,
        dimensions: frameDimensions,
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
    return { success: false }; // we can do more user facing error handling
  });

  const submit = async () => {
    if (!presetAudio && !audioProps.file) return false

    indexSet(1); // set audio working page

    if (presetAudio && preferPresetAudio) {
      MergeAndEnque({ upload_token: mediaToken }); // if there is a media token then we enque this like a "fake" audio/media response
    } else {
      UploadAudio(makeRequest(0)) // if there an audio file it uploads here
      .then((res) => {
        if ("upload_token" in res) {
          indexSet(2); // set image working page
        }
        return MergeAndEnque(res); // start image upload, then combine both responses into an enqueue request
      });
    }
  };
  const page = index === 0 ? 0 : index === 4 ? 2 : 1;
  const headerProps = { audioProps, audioReady, clearInputs, imageProps, imageReady, indexSet, page, presetAudio, preferPresetAudio, submit, t };

  const transitions = useTransition(index, {
    ...springs.soft,
    from: { opacity: 0, position: "absolute" },
    enter: { opacity: 1, position: "relative" },
    leave: { opacity: 0, position: "absolute" },
  });

  const statusTxt = (which: number, config = {}) => ["animationPending","animationInProgress","animationFailed","animationDead","animationSuccess"].map((str,i) => t(`status.${str}`,config))[which];

  return <div {...{ className: "container-panel pt-4" }}>
    <div {...{ className: "panel face-animator-main" }}>
      <FaceAnimatorTitle {...headerProps} />
      {transitions((style, i) => {
        const Page = [FaceAnimatorInput,  FaceAnimatorWorking,  FaceAnimatorSuccess ][page];
        return Page ? <Page
            {...{
              audioProps,
              imageProps,
              frameDimensions,
              frameDimensionsChange,
              disableFaceEnhancement,
              disableFaceEnhancementChange,
              enqueueInferenceJob,
              preferPresetAudio,
              preferPresetAudioSet,
              presetAudio,
              still,
              stillChange,
              sessionSubscriptionsWrapper,
              index,
              t,
              toggle: { audio: readyMedia(1), image: readyMedia(0) },
              style,
              removeWatermark,
              removeWatermarkChange,
            }}
          /> : null
      })}
    </div>
    <InferenceJobsList {...{
      t,
      onSelect: () => Analytics.voiceConversionClickDownload(),
      jobType: FrontendInferenceJobType.FaceAnimation,
      statusTxt
    }}/>
    <div {...{ className: "face-animator-mobile-sample" }}>
      <BasicVideo {...{ src: "/videos/face-animator-instruction-en.mp4" }} />
    </div>
  </div>;
}
