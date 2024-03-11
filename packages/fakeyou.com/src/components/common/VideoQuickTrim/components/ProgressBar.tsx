import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useRef
} from 'react';
import {
  Action,
  ACTION_TYPES,
} from '../reducer';
import { TrimScrubber } from './TrimScrubber';
import { PlayCursor } from './PlayCursor';

export const ProgressBar = memo(({
  readyToMount,
  timeCursorOffset,
  trimStartSeconds,
  trimDuration,
  playbarWidth,
  scrubberWidth,
  videoDuration,
  videoBuffered,
  dispatchCompState
}:{
  readyToMount: boolean;
  timeCursorOffset: number;
  trimStartSeconds: number;
  trimDuration: number;
  playbarWidth: number;
  scrubberWidth: number;
  videoDuration: number;
  videoBuffered:TimeRanges | undefined;
  dispatchCompState: (action: Action) => void;
})=>{
  const playbarRef = useRef<HTMLDivElement | null>(null);

  const playbarRefCallback = useCallback(node => {
    if (node !== null) {
      playbarRef.current = node;
      dispatchCompState({
        type: ACTION_TYPES.SET_PLAYBAR_LAYOUT,
        payload: {
          playbarWidth: node.getBoundingClientRect().width,
        }
      })
    }else{
      // console.log(node);
    }
  }, [dispatchCompState]);

  const handleWindowResize = useCallback(()=> {
    if (playbarRef.current !== null && readyToMount){
      dispatchCompState({
        type: ACTION_TYPES.SET_PLAYBAR_LAYOUT,
        payload: {
          playbarWidth: playbarRef.current.getBoundingClientRect().width,
        }
      });
    }
  },[dispatchCompState, readyToMount]);
  useLayoutEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  if(readyToMount){
    // console.log('progress bar rendering');
    return(
      <div className="playbar" ref={playbarRefCallback}>
        <div className="playbar-bg">
          {videoBuffered !== undefined && 
            <span className="loaded" style={{width: (videoBuffered.end(0) / videoDuration* 100) + "%"}} />
          }
          <span className="played" style={{width: timeCursorOffset+"px"}} />
        </div>
        <TrimScrubber
          boundingWidth={playbarWidth}
          scrubberWidth={scrubberWidth}
          trimStartSeconds={trimStartSeconds}
          trimDuration={trimDuration}
          videoDuration={videoDuration}
          onChange={(newPos: number)=>{
            const newTrimStartSeconds = newPos / (playbarWidth) * videoDuration;
            dispatchCompState({
              type: ACTION_TYPES.MOVE_TRIM,
              payload: {
                trimStartSeconds: newTrimStartSeconds,
                trimEndSeconds: newTrimStartSeconds + trimDuration
              }
            });
          }}
        />
        <PlayCursor 
          scrubPosition={timeCursorOffset}
          onChanged={(onChangedVal)=>{console.log(onChangedVal)}}
          boundingWidth={playbarWidth}
          scrubberWidth={8}
        />
      {/* END of Playbar */}</div>
    );
  }else{
    console.log('TODO: ProgressBar should rendering loading state instead of null');
    return null;
  }
});