import React, { 
} from 'react';

// import { SelectionBubbles } from "components/common";
import { STATE_STATUSES } from "../../reducer";
import { ButtonPlaypause } from './ButtonPlaypause';
import { LabelTimeDuration } from  "./LabelTimeDuration"

export const ControlBar = ({
  debug: propsDebug = false,
  status
}:{
  debug?:boolean;
  status: string;
})=>{
  const debug = false || propsDebug;
  if (debug) console.log("reRENDERING ------ ControlBar");

  if (status === STATE_STATUSES.VIDEO_METADATA_LOADED){
    return(
      <div className="d-flex w-100 justify-content-between mt-3 flex-wrap">
        <div className="playpause-external d-flex align-items-center flex-wrap mb-2">
          <ButtonPlaypause />
          {/* <Button
            className="button-repeat"
            icon={faArrowsRepeat}
            variant={isRepeatOn ? "primary":"secondary"}
            onClick={()=>dispatchCompState({type:ACTION_TYPES.TOGGLE_REPEAT})}
          /> */}
          {/* <Button
            className="button-mute"
            icon={isMuted ? faVolumeSlash : faVolume}
            variant="secondary"
            onClick={()=>dispatchCompState({type:ACTION_TYPES.TOGGLE_MUTE})}
          /> */}
          <LabelTimeDuration />
        </div>
        {/* <SelectionBubbles
          options={Object.keys(TRIM_OPTIONS)}
          onSelect={handleSetTrimDuration}
          selectedStyle="outline"
        /> */}
      </div>
    );
  }else{
    console.log('TODO: ControlBar should rendering loading state instead of null');
    return null;
  }
};

