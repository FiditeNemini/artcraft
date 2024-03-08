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
import { QuickTrimData } from '../utilities';
import { TrimScrubber } from './TrimScrubber';

export const ProgressBar = memo(({
  readyToMount,
  timeCursorOffset,
  // trimReset,
  trimStartSeconds,
  trimDuration,
  playbarWidth,
  scrubberWidth,
  videoDuration,
  dispatchCompState
}:{
  readyToMount: boolean;
  timeCursorOffset: number;
  // trimReset: number;
  trimStartSeconds: number;
  trimDuration: number;
  playbarWidth: number;
  scrubberWidth: number;
  videoDuration: number;
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
        <div className="playbar-bg" />
        <TrimScrubber
          // key={trimReset}
          boundingWidth={playbarWidth}
          scrubberWidth={scrubberWidth}
          trimStartSeconds={trimStartSeconds}
          trimDuration={trimDuration}
          videoDuration={videoDuration}
          onChange={(val: QuickTrimData)=>{
            
            dispatchCompState({
              type: ACTION_TYPES.MOVE_TRIM,
              payload: {
                trimStartSeconds: val.trimStartSeconds,
                trimEndSeconds: val.trimEndSeconds
              }
            });
            // onSelect({
            //   trimStartSeconds: val.trimStartSeconds,
            //   trimEndSeconds: val.trimEndSeconds,
            // });
          }}
        />
        <div className="playcursor" style={{left:timeCursorOffset+"px"}}/>
      {/* END of Playbar */}</div>  
    );
  }else{
    console.log('TODO: ProgressBar should rendering loading state instead of null');
    return null;
  }
});