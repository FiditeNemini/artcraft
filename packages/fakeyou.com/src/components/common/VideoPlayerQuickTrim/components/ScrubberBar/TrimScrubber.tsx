import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  // useRef,
} from 'react';
import {
  faGripDots
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withScrubbing, withScrubbingPropsI } from 'components/highorder/withScrubbing';
import { 
  VideoElementContext,
  TrimContext,
} from '../../contexts';


interface TrimScrubberPropsI {
  debug?: boolean
}
export const TrimScrubber = ({
  debug: propsDebug = false,
  ...rest
}:TrimScrubberPropsI)=>{
  const debug = false || propsDebug;
  if (debug) console.log("reRENDERING ----- Trim Scrubber");

  const videoElement = useContext(VideoElementContext);
  const trimValues = useContext(TrimContext);

  const calcScrubberPosition = useCallback(()=>{
    if (videoElement !== null && trimValues !== null){
      return (trimValues.trimStartMs / (videoElement.duration * 1000) * videoElement.getBoundingClientRect().width);
    }
    return 0;
  }, [videoElement, trimValues]);
  const calcScrubberWidth = useCallback(()=>{
    if (videoElement!==null && trimValues !==null){
      const bound = videoElement.getBoundingClientRect().width;
      return Math.round(
        trimValues.trimDurationMs / (videoElement.duration * 1000) * bound
      );
    }
    return 0
  }, [videoElement, trimValues]);
  const [{scrubberWidth, scrubberPosition}, setScrubberValues] = useState<{
    scrubberWidth:number;
    scrubberPosition: number;
  }>({
    scrubberWidth: calcScrubberWidth(),
    scrubberPosition: calcScrubberPosition()
  });

  const handleWindowResize = useCallback(()=> {
    if (videoElement !== null){
      setScrubberValues((curr)=>({
        ...curr,
        scrubberWidth:calcScrubberWidth()
      }));
    }
  },[videoElement, calcScrubberWidth]);
  useLayoutEffect(()=>{
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize])

  useEffect(()=>{
    setScrubberValues((curr)=>({
      scrubberPosition:calcScrubberPosition(),
      scrubberWidth:calcScrubberWidth()
    }));
  },[videoElement, calcScrubberPosition, calcScrubberWidth]);

  const TrimScrubberWithScrubbing = withScrubbing<withScrubbingPropsI>(() => {
    return(
      <div className="trim-scrubber">
        <FontAwesomeIcon icon={faGripDots} />
      </div>
    );
  });

  const handleOnScrubEnd = useCallback((newPos: number)=>{
    // console.log("onScrubEnd");
    if(videoElement !== null && trimValues !== null){
      const boundingWidth = videoElement.getBoundingClientRect().width
      const newStartTime = Math.round(newPos / boundingWidth * videoElement.duration * 1000);
      trimValues.onChange({
        trimStartMs: newStartTime,
        trimEndMs: newStartTime + trimValues.trimDurationMs,
      });
    }
  }, [videoElement, trimValues])

  return (
    <TrimScrubberWithScrubbing
      debug={debug}
      boundingWidth={videoElement?.getBoundingClientRect().width || 0}
      scrubberWidth={scrubberWidth}
      styleOverride={{
        top: '-1rem',
      }}
      scrubPosition={scrubberPosition}
      onScrubEnd={handleOnScrubEnd}
      {...rest}
    />
  );
};
