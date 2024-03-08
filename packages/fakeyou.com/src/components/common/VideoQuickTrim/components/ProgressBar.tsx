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
import { QuickTrimData } from '../types';
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
  }, []);

  function handleWindowResize() {
    if (playbarRef.current !== null && readyToMount){
      dispatchCompState({
        type: ACTION_TYPES.SET_PLAYBAR_LAYOUT,
        payload: {
          playbarWidth: playbarRef.current.getBoundingClientRect().width,
        }
      });
    }
  }
  useLayoutEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  if(readyToMount){
    // console.log('progress bar rendering');
    return(
      <div className="playbar" ref={playbarRefCallback}>
        <div className="playbar-bg" />
        <TrimScrubber
          // key={trimReset}
          boundingWidth={playbarWidth-scrubberWidth}
          scrubberWidth={scrubberWidth}
          trimStart={trimStartSeconds}
          trimDuration={trimDuration}
          duration={videoDuration}
          onChange={(val: QuickTrimData)=>{
            console.log(val);
            // setTrimState((curr)=>({
            //   ...curr,
            //   trimStart: val.trimStartSeconds,
            //   trimEnd: val.trimEndSeconds
            // }))
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