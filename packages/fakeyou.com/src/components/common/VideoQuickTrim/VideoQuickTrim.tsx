import React, { useState, useRef } from "react";
import { Button, VideoFakeyou } from "components/common";
import { VideoFakeyouProps } from "../VideoFakeyou/VideoFakeyou";

import './styles.scss'

interface VideoQuickTrimProps extends VideoFakeyouProps{
  onChange: ()=>void
}

type State = {
  trimDuration: number;
  fps: number;
  skipFrame: number; //start time
  frameCap: number; //endtime
  maxFrame: number; //totally duration 
}
export default function VideoQuickTrim({
  onChange,
  ...rest
}: VideoQuickTrimProps){
  const [{trimDuration, ...state}, setState] = useState<State>({
    trimDuration:3,
    fps: 24,
    skipFrame:0,
    frameCap: 3*24,
    maxFrame: 3*24,
  });

  console.log(state);

  const handleChangeTrimDuration = (newTrim: number) =>{
    setState((curr)=>({
      ...curr,
      trimDuration: newTrim,
      frameCap: curr.skipFrame+ newTrim*curr.fps
    }))
  }
  return (
    <div className="fy-video-quicktrim">
      <div className="video-wrapper">
        <VideoFakeyou {...rest} controls={false}/>
        <div className="playpause-overlay">PLAY</div>
      </div>
      <div className="playbar">
        <div className="trimzone" />
        <div className="playcursor"/>
      </div>
      <div className="d-flex w-100 justify-content-center">
        <Button label="3s"
          isActive={trimDuration===3}
          onClick={()=>handleChangeTrimDuration(3)}
        />
        <Button label="5s"
          isActive={trimDuration===5}
          onClick={()=>handleChangeTrimDuration(5)}
        />
        <Button label="10s"
          isActive={trimDuration===10}
          onClick={()=>handleChangeTrimDuration(10)}
        />
        <Button label="15s"
          isActive={trimDuration===15}
          onClick={()=>handleChangeTrimDuration(15)}
        />
        <Button label="20s"
          isActive={trimDuration===20}
          onClick={()=>handleChangeTrimDuration(20)}
        />
      </div>
    </div>
  );
}