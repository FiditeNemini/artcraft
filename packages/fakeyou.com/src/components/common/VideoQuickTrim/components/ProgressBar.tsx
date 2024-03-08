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
  trimReset,
  trimStartSeconds,
  trimDuration,
  playbarWidth,
  scrubberWidth,
  videoDuration,
  dispatchCompState
}:{
  readyToMount: boolean;
  timeCursorOffset: number;
  trimReset: number;
  trimStartSeconds: number;
  trimDuration: number;
  playbarWidth: number;
  scrubberWidth: number;
  videoDuration: number;
  dispatchCompState: (action: Action) => void;
})=>{
  const playbarRef = useRef<HTMLDivElement | null>(null);

  function setPlaybarLayout(playbarWidth: number){
    if(readyToMount) {
      dispatchCompState({
        type: ACTION_TYPES.SET_PLAYBAR_LAYOUT,
        payload: {
          playbarWidth: playbarWidth,
        }
      })
    }else{
      console.log('set playbar layout but not ready to mount')
    }
  }
  const playbarRefCallback = useCallback(node => {
    console.log('playbar usecallback fired');
    if (node !== null) {
      playbarRef.current = node;
      // setPlaybarLayout(node.getBoundingClientRect().width);
      dispatchCompState({
        type: ACTION_TYPES.SET_PLAYBAR_LAYOUT,
        payload: {
          playbarWidth: node.getBoundingClientRect().width,
        }
      })
    }else{
      console.log(node);
    }
  }, []);

  function handleWindowResize() {
    if (playbarRef.current !== null ){
      setPlaybarLayout(playbarRef.current.getBoundingClientRect().width);
    }
  }
  useLayoutEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  if(readyToMount){
    console.log('progress bar rendering');
    return(
      <div className="playbar" ref={playbarRefCallback}>
        <div className="playbar-bg" />
        <TrimScrubber
          key={trimReset}
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
    console.log('progress bar rendering null');
    return null;
  }
  
  /*trimScrubberWidth > 0 && 
    playbarWidth > 0 && 
    maxDuration > 0 &&
    <TrimScrubber
      key={trimReset}
      boundingWidth={playbarWidth-trimScrubberWidth}
      scrubberWidth={trimScrubberWidth}
      trimStart={trimStart}
      trimDuration={trimDuration}
      duration={maxDuration}
      onChange={(val: QuickTrimData)=>{
        //console.log(val);
        setTrimState((curr)=>({
          ...curr,
          trimStart: val.trimStartSeconds,
          trimEnd: val.trimEndSeconds
        }))
        onSelect({
          trimStartSeconds: val.trimStartSeconds,
          trimEndSeconds: val.trimEndSeconds,
        });
      }}
    />
  } */
    


});