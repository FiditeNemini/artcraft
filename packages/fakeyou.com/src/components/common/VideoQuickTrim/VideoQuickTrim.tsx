import React, { useState, useRef } from "react";
import {
  faPlay,
  faPause
} from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTimePortion, setCurretTimePortion] = useState<number>(0);
  if(videoRef.current)
    videoRef.current.ontimeupdate = (e)=>{
      if(videoRef.current){
        console.log(`${videoRef.current.currentTime}/${videoRef.current.duration}  ${videoRef.current.currentTime / videoRef.current.duration}`);
        setCurretTimePortion(
          Math.round(videoRef.current.currentTime / videoRef.current.duration * 10000) / 100);
      }
    }

  const [playpause, setPlaypause] = useState<'playing'|'paused'|'stopped'>('paused');
  const [{trimDuration, ...state}, setState] = useState<State>({
    trimDuration:3,
    fps: 24,
    skipFrame:0,
    frameCap: 3*24,
    maxFrame: 3*24,
  });

  // console.log(state);

  const handleChangeTrimDuration = (newTrim: number) =>{
    setState((curr)=>({
      ...curr,
      trimDuration: newTrim,
      frameCap: curr.skipFrame+ newTrim*curr.fps
    }))
  }
  const handlePlaypause = ()=>{
    if (playpause === 'paused' || playpause === 'stopped'){
      videoRef.current?.play();
      setPlaypause('playing');
    }else{
      videoRef.current?.pause();
      setPlaypause('paused');
    }
  }
  return (
    <div className="fy-video-quicktrim">
      <div className="video-wrapper">
        <VideoFakeyou
          controls={false}
          ref={videoRef}
          {...rest}
        />
        <div className="playpause-overlay" onClick={handlePlaypause}>
          {playpause === 'paused' && 
            <FontAwesomeIcon className="playpause-icon"
              icon={faPlay} size="8x"
            />
          }
          {playpause === 'playing' &&
            <FontAwesomeIcon className="playpause-icon"
              icon={faPause} size="8x"
            />
          }
          
        </div>
      </div>
      <div className="playbar">
        <div className="trimzone" />
        <div className="playcursor" style={{left: currentTimePortion+"%"}}/>
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