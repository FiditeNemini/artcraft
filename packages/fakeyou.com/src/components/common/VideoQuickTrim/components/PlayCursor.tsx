import React, {
  useContext,
  useState,
  useEffect
} from 'react';
import { withScrubbing, withScrubbingPropsI } from './withScrubbing';

import { VideoElementContext } from '../contexts';
import { ONE_MS } from '../utilities';

interface PlayCursorPropsI extends withScrubbingPropsI{
  isRepeatOn: boolean;
  playBoundStart: number;
  playBoundEnd: number;
  onChanged: (posPercent: number)=>void;
}

export const PlayCursor = ({
  isRepeatOn,
  playBoundStart,
  playBoundEnd,
  onChanged,
  ...rest
}:PlayCursorPropsI)=>{
  const videoElement = useContext(VideoElementContext);
  const [timeCursorOffset, setTimeCursorOffset] = useState(0);
  const PlayCursorWithScrubbing = withScrubbing<withScrubbingPropsI>(()=>{
    return(
      <div className="playcursor" />
    );
  });
  useEffect(()=>{
    const handleTimeCursorPosition = ()=>{
      if(videoElement!==null){
        if(isRepeatOn && (
            videoElement.currentTime < playBoundStart ||
            videoElement.currentTime > playBoundEnd
        )){
          videoElement.currentTime = playBoundStart + ONE_MS
        }
        const newOffset = (videoElement.currentTime / videoElement.duration) * (rest.boundingWidth);
        setTimeCursorOffset(newOffset);
      }
    };
    videoElement?.addEventListener("timeupdate", handleTimeCursorPosition);
    return()=>{
      videoElement?.removeEventListener("timeupdate",handleTimeCursorPosition);
    }
  },[videoElement, isRepeatOn, playBoundStart, playBoundEnd, rest.boundingWidth]);

  return(
    <PlayCursorWithScrubbing
      onScrubEnd={onChanged}
      scrubPosition={timeCursorOffset}
      {...rest}
    />
  );
};
