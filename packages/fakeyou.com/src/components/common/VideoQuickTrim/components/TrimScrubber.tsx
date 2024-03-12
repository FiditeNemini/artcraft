import React, {
  memo,
} from 'react';
import {
  faGripDots
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withScrubbing, withScrubbingPropsI } from './withScrubbing';

interface TrimScrubberPropsI extends withScrubbingPropsI {
  trimStartSeconds:number;
  trimDuration: number;
  videoDuration: number;
  onChange:(newPos:number)=>void
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

  return (
    <TrimScrubberWithScrubbing
      styleOverride={{
        top: '-1rem',
      }}
      scrubPosition={trimStartSeconds/videoDuration*(rest.boundingWidth)}
      onScrubChanged={onChange}
      {...rest}
    />
  );
});
