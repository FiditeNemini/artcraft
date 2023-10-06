import React, { useState } from 'react';
import { animated, useSpring } from "@react-spring/web";
import { useVideo } from "hooks";
import { AudioInput, Checkbox, ImageInput, SegmentButtons } from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FaceAnimatorSlide } from "./FaceAnimatorTypes";

export default function FaceAnimatorInput({  
  audioProps,
  imageProps,
  frameDimensions,
  frameDimensionsChange,
  disableFaceEnhancement,
  disableFaceEnhancementChange,
  still,
  stillChange,
  toggle,
  style,
  t,
  removeWatermark,
  removeWatermarkChange, }: FaceAnimatorSlide) {
  const [tint,tintSet] = useState(true);
  const [{ playCtrl },vidProps] = useVideo({ onEnded: () => tintSet(true) });
  const tintSpring = useSpring({
    onRest: () => { if (!tint) { playCtrl!(tintSet) }},
    opacity: tint ? 1 : 0
  });
  const overlayClick = () => tintSet(!tint);

  return <animated.div {...{ className: "lipsync-editor row", style }}>
    <div {...{ className: "media-input-column col-lg-6" }}>
      <h5>{t("headings.image")}</h5>
      <ImageInput
        {...{
          ...imageProps,
          onRest: () => toggle.image(imageProps.file ? true : false),
        }}
      />
    </div>
    <div {...{ className: "media-input-column audio-input-column col-lg-6" }}>
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
      <div {...{ className: "video-frame" }}>
        <video {...{ playsInline: true, ...vidProps }}>
          <source src="/videos/face-animator-instruction-en.mp4" type="video/mp4" />
        </video>
        <animated.div {...{ className: "video-overlay", onClick: overlayClick, style: tintSpring }}>
          <h6>Face Animator Sample</h6>
          <FontAwesomeIcon icon={faPlay} />
        </animated.div>
      </div>
    </div>
    <div {...{ className: "animation-configure-panel panel" }}>
      <fieldset {...{ className: "input-block" }}>
        <legend>Video Dimensions</legend>
        <SegmentButtons {...{
          onChange: frameDimensionsChange,
          options: [{ label: "Landscape (Wide)", value: "twitter_landscape" },{ label: "Portrait (Tall)", value: "twitter_portrait" },{ label: "Square", value: "twitter_square" }],
          value: frameDimensions
        }}/>
      </fieldset>
      <fieldset {...{ className: "input-block" }}>
        <legend>Watermark</legend>
        <Checkbox {...{ checked: removeWatermark, label: "Remove Watermark (premium only)", onChange: removeWatermarkChange }}/>
      </fieldset>
      <fieldset {...{ className: "input-block" }}>
        <legend>Animation</legend>
        <Checkbox {...{ checked: still, label: "Reduce Movement (not recommended)", onChange: stillChange}}/>
        <Checkbox {...{ checked: disableFaceEnhancement, label: "Disable Face Enhancer (not recommended)", onChange: disableFaceEnhancementChange}}/>
      </fieldset>
    </div>
  </animated.div>;
};