import React, {
  useState,
  useEffect,
  useContext,
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
import { VideoElementContext } from '../contexts';

export const ProgressBar = ({
  debug: propsDebug = false,
  readyToMount,
  isRepeatOn,
  trimStartSeconds,
  trimEndSeconds,
  trimDuration,
  playbarWidth,
  scrubberWidth,
  videoDuration,
  onPlayCursorChanged,
  handlePlaypause,
  dispatchCompState
}:{
  debug?: boolean;
  readyToMount: boolean;
  isRepeatOn: boolean;
  trimStartSeconds: number;
  trimEndSeconds: number;
  trimDuration: number;
  playbarWidth: number;
  scrubberWidth: number;
  videoDuration: number;
  onPlayCursorChanged: (newPos: number) => void;
  handlePlaypause: (shouldPlay:boolean)=>void;
  dispatchCompState: (action: Action) => void;
})=>{
  console.log(`ProgressBAR reRENDERING`)
  const debug = false || propsDebug;
  if(debug) console.log("reRENDERING --- Progress Bar");
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
        <Progress />
        <TrimScrubber
          debug={debug}
          boundingWidth={playbarWidth}
          scrubberWidth={scrubberWidth}
          trimStartSeconds={trimStartSeconds}
          trimDuration={trimDuration}
          videoDuration={videoDuration}
          handlePlaypause={()=>handlePlaypause(false)}
          onChange={(newPos: number)=>{
            const newTrimStartSeconds = newPos / (playbarWidth) * videoDuration;
            dispatchCompState({
              type: ACTION_TYPES.MOVE_TRIM,
              payload: {
                trimStartSeconds: newTrimStartSeconds,
                trimEndSeconds: newTrimStartSeconds + trimDuration
              }
            });
            // handlePlaypause(true);
          }}
        />
        <PlayCursor
          isRepeatOn={isRepeatOn}
          onChanged={onPlayCursorChanged}
          playBoundStart={trimStartSeconds}
          playBoundEnd={trimEndSeconds}
          boundingWidth={playbarWidth}
          scrubberWidth={8}
        />
      {/* END of Playbar */}</div>
    );
  }else{
    console.log('TODO: ProgressBar should rendering loading state instead of null');
    return null;
  }
};

function Progress (){
  const vidEl = useContext(VideoElementContext);
  const [buffered, setBuffered] = useState<number>(0);
  useEffect(()=>{
    function handleBuffer(){
      if(vidEl && vidEl.buffered.length > 0){
        setBuffered(vidEl.buffered.end(0))
      }
    }
    vidEl?.addEventListener("progress", handleBuffer);
  },[vidEl]);

  if(vidEl){
    return(
      <div className="playbar-bg">
        <span className="loaded" style={{width: (buffered / vidEl.duration* 100) + "%"}} />
        {/* <span className="played" style={{width: timeCursorOffset+"px"}} /> */}
      </div>
    );
  }
  else return null;
}