import React,{
  memo
} from 'react'
import {
  faArrowsRepeat,
  faPlay,
  faPause,
  faVolume,
  faVolumeSlash,
} from "@fortawesome/pro-solid-svg-icons";
import {
  Action,
  ACTION_TYPES,
  PLAYPUASE_STATES
} from '../reducer';
import { Button, SelectionBubbles } from "components/common";
import { TRIM_OPTIONS, formatSecondsToHHMMSSCS } from "../utilities";

export const ControlBar = memo(({
  videoCurrentTime,
  videoDuration,
  isRepeatOn,
  isMuted,
  playpause,
  handlePlaypause,
  dispatchCompState
}:{
  videoCurrentTime: number | undefined;
  videoDuration: number | undefined;
  isMuted: boolean,
  isRepeatOn: boolean;
  playpause: string;
  handlePlaypause: ()=>void;
  dispatchCompState: (action: Action) => void;
})=>{
  function handleSetTrimDuration(selected: string){
    dispatchCompState({
      type: ACTION_TYPES.SET_TRIM_DURATION,
      payload: {
        trimDurationString: selected
      }
    });
      // onSelect({
      //   trimStartSeconds: newTrimStart,
      //   trimEndSeconds: newTrimEnd,
      // });
  };
  
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
});