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
  handlePlaypause: ()=> void;
  onChange:(newPos:number)=>void
}
export const TrimScrubber = memo(({
  debug: propsDebug = false,
  trimStartSeconds,
  trimDuration,
  videoDuration,
  handlePlaypause,
  onChange,
  ...rest
}:TrimScrubberPropsI)=>{
  const debug = false || propsDebug;

  const TrimScrubberWithScrubbing = withScrubbing<TrimScrubberPropsI>(() => {
    return(
      <div className="trim-scrubber">
        <FontAwesomeIcon icon={faGripDots} />
      </div>
    );
  });

  return (
    <TrimScrubberWithScrubbing
      debug={debug}
      styleOverride={{
        top: '-1rem',
      }}
      scrubPosition={trimStartSeconds/videoDuration*(rest.boundingWidth)}
      onScrubStart={handlePlaypause}
      onScrubEnd={onChange}
      {...rest}
    />
  );
});
