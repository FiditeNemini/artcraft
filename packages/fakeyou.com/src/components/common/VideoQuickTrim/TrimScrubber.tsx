import React from 'react';
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
export const TrimScrubber = (props:TrimScrubberPropsI)=>{

  const TrimScrubberWithScrubbing = 
    withScrubbing<TrimScrubberPropsI>(() => {
      return(
        <div className="trim-scrubber">
          <FontAwesomeIcon icon={faGripDots} />
        </div>
      );
    });

  return (
    <TrimScrubberWithScrubbing
      styleOverride={{
        top: '-1rem',
      }}
      {...props}
    />
  )
}


