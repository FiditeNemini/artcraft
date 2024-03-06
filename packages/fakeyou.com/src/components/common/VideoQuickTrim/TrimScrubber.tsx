import React, {
  memo,
  useCallback
} from 'react';
import {
  faGripDots
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QuickTrimData } from './types';
import {withScrubbing, withScrubbingPropsI} from './withScrubbing';

interface TrimScrubberPropsI extends withScrubbingPropsI {
  trimStart:number;
  trimDuration: number;
  duration: number;
  onChange:(val:QuickTrimData)=>void
}
export const TrimScrubber = memo(({
  trimStart,
  trimDuration,
  duration,
  onChange,
  ...rest
}:TrimScrubberPropsI)=>{
  const TrimScrubberWithScrubbing = 
    withScrubbing<TrimScrubberPropsI>(() => {
      return(
        <div className="trim-scrubber">
          <FontAwesomeIcon icon={faGripDots} />
        </div>
      );
    });
  
  const handleOnChange = useCallback((posPercent:number)=>{
    onChange({
      trimStartSeconds: duration * posPercent,
      trimEndSeconds: duration * posPercent + trimDuration,
    });
  }, [onChange, duration, trimDuration])
  return (
    <TrimScrubberWithScrubbing
      styleOverride={{
        top: '-1rem',
      }}
      initialLeftOffsetPercent={trimStart/trimDuration}
      onScrubEnds={handleOnChange}
      {...rest}
    />
  )
});
