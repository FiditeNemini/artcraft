import React from 'react';
import { withScrubbing, withScrubbingPropsI } from './withScrubbing';

interface PlayCursorPropsI extends withScrubbingPropsI{
  onChanged: (posPercent: number)=>void;
}

export const PlayCursor = ({
  onChanged,
  ...rest
}:PlayCursorPropsI)=>{
  const PlayCursorWithScrubbing = withScrubbing<withScrubbingPropsI>(()=>{
    return(
      <div className="playcursor" />
    );
  });

  return(
    <PlayCursorWithScrubbing
      onScrubChanged={onChanged}
      {...rest}
    />
  );
};
