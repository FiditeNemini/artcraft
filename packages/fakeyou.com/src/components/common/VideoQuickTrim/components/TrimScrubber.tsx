import React, {
  memo,
  useCallback
} from 'react';
import {
  faGripDots
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QuickTrimData } from '../utilities';
import {withScrubbing, withScrubbingPropsI} from './withScrubbing';

interface TrimScrubberPropsI extends withScrubbingPropsI {
  trimStartSeconds:number;
  trimDuration: number;
  videoDuration: number;
  onChange:(val:QuickTrimData)=>void
}
export const TrimScrubber = memo(({
  trimStartSeconds,
  trimDuration,
  videoDuration,
  onChange,
  ...rest
}:TrimScrubberPropsI)=>{

  const TrimScrubberWithScrubbing = withScrubbing<TrimScrubberPropsI>(() => {
    return(
      <div className="trim-scrubber">
        <FontAwesomeIcon icon={faGripDots} />
      </div>
    );
  });
  
  const handleOnChange = useCallback((posPercent:number)=>{
    console.log(`handle on moving trim scrubber, pos%=${posPercent}`);
    onChange({
      trimStartSeconds: videoDuration * posPercent,
      trimEndSeconds: videoDuration * posPercent + trimDuration,
    });
  }, [onChange, videoDuration, trimDuration]);

  return (
    <TrimScrubberWithScrubbing
      styleOverride={{
        top: '-1rem',
      }}
      initialLeftOffsetPercent={trimStartSeconds/videoDuration}
      onScrubEnds={handleOnChange}
      {...rest}
    />
  )
});
