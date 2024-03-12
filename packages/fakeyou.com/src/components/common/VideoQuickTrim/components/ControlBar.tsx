import React, { memo } from 'react'
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

export const ControlBar = memo(({
  debug: propsDebug = false,
  readyToMount,
  videoCurrentTime,
  videoDuration,
  isRepeatOn,
  isMuted,
  playpause,
  handlePlaypause,
  dispatchCompState
}:{
  debug?:boolean;
  readyToMount: boolean;
  videoCurrentTime: number | undefined;
  videoDuration: number | undefined;
  isMuted: boolean,
  isRepeatOn: boolean;
  playpause: string;
  handlePlaypause: ()=>void;
  dispatchCompState: (action: Action) => void;
})=>{
  const debug = false || propsDebug;
  if (debug) console.log("ControlBar reRENDERED!!");
  
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
          <div className="playtime d-flex">
            <span >
              <p>
                {`${formatSecondsToHHMMSSCS(
                  videoCurrentTime || 0
                )}`}
              </p>
            </span>
            <div>/</div>
            <span>
              <p>
                {`${formatSecondsToHHMMSSCS(videoDuration || 0)}`}
              </p>
            </span>
          </div>
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

});