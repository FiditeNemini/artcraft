import React, { useState } from "react";
import { animated, useSpring, useTransition } from '@react-spring/web';
import { useFile } from "hooks";
import { AudioInput, ImageInput, Spinner } from "components/common";
import DynamicButton from './DynamicButton';
import './LipsyncEditor.scss';

interface LipSyncProps { audioProps: any, imageProps: any, toggle: any, style: any };

const softSpring = { config: { mass: 1, tension: 80, friction: 10 } }

const SuccessPage = ({ audioProps, imageProps, style }: LipSyncProps )  => <animated.div {...{ className: "lipsync-success", style }}>
  <h3 className=" fw-bold text-center text-lg-start">
    Result
  </h3>
  <video width="100%" height="auto" controls={true} className="rounded">
    <source src="https://pics.vics.pics/3027969248.mp4" />
    Your device doesn't support video.
  </video>
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

const WorkingPage = ({ audioProps, imageProps, style }: LipSyncProps ) => <animated.div {...{ className: "lipsync-working", style }}>
  <div {...{ className: "lipsync-working-notice" }}>
    <h2>Working ...</h2>
    <Spinner />
  </div>
</animated.div>;

const ProgressLi = ({ children, disabled = false }: { children?: any, disabled?: boolean }) => {
  const style = useSpring({
    ...softSpring,
    opacity: disabled ? .25 : 1
  });
  return <animated.li {...{ style }}>
    <svg>
      <circle {...{ cx: 16, cy: 16, r: 15, strokeWidth: "2", }}/>
      { <polyline {...{
        fill: 'none',
        points: '9.5 18 14.5 22 22.5 12',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '4',
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

  const slides = ["Generate",<Spinner />,"Make another"];

  const onClick = () => {
    if (imageProps.success && audioProps.success) {
      imageProps.clear(); audioProps.clear();
    } else if (!incomplete && !working) submit();
  };

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
    <DynamicButton {...{ disabled: incomplete || working, onClick, slides, index }}/>
    <p {...{ className: 'progress-description' }}> 
      Select and image with a clear face, and an audio sample, and generate a lipsynced video.
    </p>
  </div>
};

export default function LipsyncEditor({ ...rest }) {
  const [imageReady,imageReadySet] = useState<boolean>(false);
  const [audioReady,audioReadySet] = useState<boolean>(false);
  const readyMedia = (m:number) => (t:boolean) => [imageReadySet,audioReadySet][m](t);
  const onSubmit = async () => {
    await new Promise(resolve => {
        setTimeout(function () {
            resolve();
        }, 6000);
    });
    return true;
  };
  const audioProps = useFile({ debug: 'audio useFile', onSubmit });
  const imageProps = useFile({ onSubmit });
  const index = audioProps.status === imageProps.status ? audioProps.status : -1;
  const headerProps = {
    audioProps,
    audioReady,
    imageProps,
    imageReady,
    index,
    submit: () => {
      audioProps.submit(); imageProps.submit();
    }
  };

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
            const Page = [InputPage,WorkingPage,SuccessPage][i];
            return i > -1 ? <Page {...{ 
              audioProps,
              imageProps,
              toggle: { audio: readyMedia(1), image: readyMedia(0) },
              style 
            }}/> : null
          }) }
        </div>
      </div>
	</div>;
};