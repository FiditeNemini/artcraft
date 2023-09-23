import React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { Spinner } from "components/common";
import { springs } from "resources";
import DynamicButton from './DynamicButton';

const ProgressLi = ({ children, disabled = false }: { children?: any, disabled?: boolean }) => {
  const style = useSpring({
    ...springs.soft,
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

export default function FaceAnimatorTitle({ ...rest }) {
  const { audioProps, audioReady, imageProps, imageReady, indexSet, page, submit } = rest;
  const noAudio = !audioReady || !audioProps.file;
  const noImg = !imageReady || !imageProps.file;
  const incomplete = noAudio || noImg;
  const working = imageProps.working && audioProps.working;

  const slides = ["Generate",<Spinner />,"Make another"];

  const onClick = () => {
    if (page === 2) {
      imageProps.clear(); audioProps.clear(); indexSet(0);
    } else if (!incomplete && !working) submit();
  };

  return <div {...{ className: "progress-header" }}>
    <h1 {...{ className: "fw-bold text-center text-md-start progress-heading" }}>
      Face Animator
    </h1>
    <ul {...{ className: 'async-progress-tracker' }}>
      <ProgressLi {...{ disabled: noImg }}>
        Image
      </ProgressLi>
      <ProgressLi {...{ disabled: noAudio }}>
        Audio
      </ProgressLi>
    </ul>
    <DynamicButton {...{ disabled: incomplete || working, onClick, slides, index: page }}/>
    <p {...{ className: "progress-description" }}> 
      Select and image with a clear face, and an audio sample, and generate a lipsynced video.
    </p>
  </div>
};