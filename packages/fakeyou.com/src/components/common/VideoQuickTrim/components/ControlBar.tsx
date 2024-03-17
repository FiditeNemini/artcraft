import React, { 
  useState,
  useContext,
  useEffect,
} from 'react';

import {
  faArrowsRepeat,
  faPlay,
  faPause,
  faVolume,
  faVolumeSlash,
} from "@fortawesome/pro-solid-svg-icons";

import { Button, SelectionBubbles } from "components/common";

import {
  Action,
  ACTION_TYPES,
  PLAYPUASE_STATES
} from '../reducer';
import { TRIM_OPTIONS, formatSecondsToHHMMSSCS } from "../utilities";
import { VideoElementContext } from '../contexts';

export const ControlBar = ({
  debug: propsDebug = false,
  readyToMount,
  isRepeatOn,
  isMuted,
  playpause,
  handlePlaypause,
  dispatchCompState
}:{
  debug?:boolean;
  readyToMount: boolean;
  isMuted: boolean,
  isRepeatOn: boolean;
  playpause: string;
  handlePlaypause: ()=>void;
  dispatchCompState: (action: Action) => void;
})=>{
  const debug = false;// || propsDebug;
  if (debug) console.log("reRENDERING ------ ControlBar");

  function handleSetTrimDuration(selected: string){
    dispatchCompState({
      type: ACTION_TYPES.SET_TRIM_DURATION,
      payload: {
        trimDurationString: selected
      }
    });
  };
  if(readyToMount){
    return(
      <div className="d-flex w-100 justify-content-between mt-3 flex-wrap">
        <div className="playpause-external d-flex align-items-center flex-wrap mb-2">
          <Button
            className="button-playpause"
            icon={ playpause === PLAYPUASE_STATES.PLAYING 
              ? faPause : faPlay
            }
            variant="secondary"
            onClick={handlePlaypause}
          />
          <Button
            className="button-repeat"
            icon={faArrowsRepeat}
            variant={isRepeatOn ? "primary":"secondary"}
            onClick={()=>dispatchCompState({type:ACTION_TYPES.TOGGLE_REPEAT})}
          />
          <Button
            className="button-mute"
            icon={isMuted ? faVolumeSlash : faVolume}
            variant="secondary"
            onClick={()=>dispatchCompState({type:ACTION_TYPES.TOGGLE_MUTE})}
          />
          <TimeLabel />
        </div>
        <SelectionBubbles
          options={Object.keys(TRIM_OPTIONS)}
          onSelect={handleSetTrimDuration}
          selectedStyle="outline"
        />
      </div>
    );
  }else{
    console.log('TODO: ControlBar should rendering loading state instead of null');
    return null;
  }

};

function TimeLabel(){
  const vidEl = useContext(VideoElementContext);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(()=>{
    function handleTimeStamp(){
      setCurrentTime(vidEl?.currentTime ||0);
    };
    function handleDuration(){
      setDuration(vidEl?.duration ||0)
    };
    vidEl?.addEventListener("timeupdate", handleTimeStamp);
    vidEl?.addEventListener("loadmetadata", handleDuration);
    return()=>{
      vidEl?.removeEventListener("timeupdate",handleTimeStamp);
      vidEl?.addEventListener("loadmetadata", handleDuration);
    }
  },[vidEl]);
  return(
    <div className="playtime d-flex">
      <span>
        <p>
          {`${formatSecondsToHHMMSSCS(currentTime)}`}
        </p>
      </span>
      <div>/</div>
      <span>
        <p>
          {`${formatSecondsToHHMMSSCS(duration)}`}
        </p>
      </span>
    </div>
  );
}