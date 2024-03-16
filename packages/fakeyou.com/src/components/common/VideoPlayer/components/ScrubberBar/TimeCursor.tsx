import React, {
  useContext,
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import { withScrubbing, withScrubbingPropsI } from './withScrubbing';

import { VideoElementContext } from '../../contexts';

interface TimeCursorPropsI {
  debug?: boolean
}

export const TimeCursor = ({
  debug: propsDebug = false,
  ...rest
}:TimeCursorPropsI)=>{
  const debug = false || propsDebug;
  if (debug) console.log("reRENDERING ----- Time Cursor");

  const videoElement = useContext(VideoElementContext);
  const [timeCursorOffset, setTimeCursorOffset] = useState(0);
  const [boundingWidth, setBoundingWidth] = useState(videoElement?.getBoundingClientRect().width || 0);

  const PlayCursorWithScrubbing = withScrubbing<withScrubbingPropsI>(()=>{
    return(
      <div className="playcursor" />
    );
  });
  useEffect(()=>{
    const handleTimeCursorPosition = ()=>{
      if(videoElement!==null){
        const newOffset = (videoElement.currentTime / videoElement.duration) * (boundingWidth);
        
        setTimeCursorOffset(newOffset);
      }
    };
    videoElement?.addEventListener("timeupdate", handleTimeCursorPosition);
    return()=>{
      videoElement?.removeEventListener("timeupdate",handleTimeCursorPosition);
    }
  },[videoElement, boundingWidth]);

  const handleWindowResize = useCallback(()=> {
    if (videoElement !== null){
      console.log("BOUNDING WIDTH IS " + videoElement.getBoundingClientRect().width);
      setBoundingWidth(videoElement.getBoundingClientRect().width)
    }
  },[videoElement]);

  useLayoutEffect(()=>{
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize])

  const handleOnScrubEnd = useCallback( (newPos: number)=>{
    if(videoElement !== null){
      const newTime = newPos / boundingWidth * videoElement.duration;
      videoElement.currentTime = newTime;
    }
  },[videoElement, boundingWidth]);
  
  return(
    <PlayCursorWithScrubbing
      boundingWidth={boundingWidth}
      scrubberWidth={8}
      onScrubEnd={handleOnScrubEnd}
      scrubPosition={timeCursorOffset}
      {...rest}
    />
  );
};
