import React, { useState } from "react";
import { animated, useChain, useSpring, useSpringRef, useTransition } from '@react-spring/web';
import { useFile } from "hooks";
import { AudioInput, ImageInput } from "components/common";
import DynamicButton from './DynamicButton';
import './LipsyncEditor.scss';

interface LipSyncProps { audioProps: any, imageProps: any, ready: any, style: any };

const SuccessPage = ({ audioProps, imageProps, style }: LipSyncProps )  => <animated.div {...{ className: "lipsync-success", style }}>
  <h1 className=" fw-bold text-center text-lg-start">
    Lipsync Result
  </h1>
  <video width="100%" height="auto" controls={true} className="rounded">
    <source src="https://pics.vics.pics/3027969248.mp4" />
    Your device doesn't support video.
  </video>
</animated.div>;

const InputPage = ({ audioProps, imageProps, ready, style }: LipSyncProps )  => <animated.div {...{ className: "lipsync-editor", style }}>
  <div {...{ className: "grid-heading" }}>
    <h5>Image</h5>
  </div>
  <div {...{ className: "grid-heading" }}>
    <h5>Audio</h5>
  </div>
  <div {...{ className: "grid-square lipsync-audio" }}>
    <ImageInput {...{ ...imageProps, onRest: () => ready.image(imageProps.file ? true : false) }}/>
  </div>
  <div {...{ className: "grid-square" }}>
    <AudioInput {...{ ...audioProps, onRest: () => ready.audio(audioProps.file ? true : false), hideActions: true } }/>
  </div>
</animated.div>;

const WorkingPage = ({ audioProps, imageProps, style }: LipSyncProps ) => <animated.div {...{ className: "lipsync-editor", style }}>
  Hi smile :)
</animated.div>;

const ProgressCheck = ({ disabled = false, refB }: {disabled?: boolean, refB: any }) => {
  const style = useSpring({
    config: { mass: 1, tension: 160, friction: 5 },
    // opacity: disabled ? .25 : 1
  });
  return <animated.svg {...{ style }}>
    <circle {...{ cx: 16, cy: 16, r: 15, strokeWidth: "2", }}/>
    { <polyline {...{
      fill: 'none',
      // points: '7 16 12 20 20 10',
      points: '9.5 18 14.5 22 22.5 12',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '4',
    }}/> }
  </animated.svg>;
};

const ProgressLi = ({ children, disabled = false }: { children?: any, disabled?: boolean}) => {
  const refA = useSpringRef();
  const refB = useSpringRef();
  useChain([refA, refB]);
  const style = useSpring({
    config: { mass: 1, tension: 80, friction: 10 },
    opacity: disabled ? .25 : 1
  });
  return <animated.li {...{ style }}>
    <ProgressCheck {...{ disabled, refB }}/>
    { children }
  </animated.li>
};

const Title = ({ ...rest }) => {
  const { audioProps, audioReady, imageProps, imageReady, submit } = rest;
  const noAudio = !audioReady || !audioProps.file;
  const noImg = !imageReady || !imageProps.file;
  const incomplete = noAudio || noImg;
  return <div {...{ className: 'progress-header' }}>
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
    <DynamicButton {...{ disabled: incomplete || (imageProps.success && audioProps.success), onClick: submit }}>Generate</DynamicButton>
    <p {...{ className: 'progress-description' }}> 
    Select an image with a clear face, or one of our existing templates, then choose either text to speech or uploaded audio(eg. music). Then you can generate a beautifully lipsynced video.
    </p>
  </div>
};

export default function LipsyncEditor({ ...rest }) {
  const [imageReady,imageReadySet] = useState<boolean>(false);
  const [audioReady,audioReadySet] = useState<boolean>(false);
  const readyMedia = (m:number,t:boolean) => () => {
    console.log("🥒",m,t);
    [imageReadySet,audioReadySet][m](t)};
  const onSubmit = async () => true;
  const audioProps = useFile({ debug: 'audio useFile',onClear: () => readyMedia(1,false), onSubmit });
  const imageProps = useFile({ onClear: () => readyMedia(0,false), onSubmit });
  console.log("😎",imageReady,audioReady);
  const headerProps = {
    audioProps,
    audioReady,
    imageProps,
    imageReady,
    submit: () => {
      audioProps.submit(); imageProps.submit();
    }
  };

  const index = imageProps.success && audioProps.success ? 2 : imageProps.working && audioProps.working ? 1 : 0;

  const transitions = useTransition(index, {
    config: { tension: 130,  friction: 20 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

	return <div>
      <div {...{ className: "container" }}>
        <Title { ...headerProps }/>
        <div {...{ className: "panel" }}>
          { transitions((style, i) => {
            const Page = [InputPage,WorkingPage,SuccessPage][i];
            return <Page {...{ 
              audioProps,
              imageProps,
              ready: { audio: readyMedia(1,true), image: readyMedia(0,true) },
              style 
            }}/>
          }) }
        </div>
      </div>
	</div>;
};