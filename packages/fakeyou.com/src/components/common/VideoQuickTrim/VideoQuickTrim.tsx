import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  PointerEvent
} from "react";
import {
  faPlay,
  faPause
} from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, VideoFakeyou } from "components/common";
import { VideoFakeyouProps } from "../VideoFakeyou/VideoFakeyou";

import './styles.scss'

function fractionToPercentage(fraction:number){
  return Math.round(fraction * 10000) / 100;
}

interface VideoQuickTrimProps extends VideoFakeyouProps{
  onChange: ()=>void;
}

type TrimState = {
  isScrubbingTrim: boolean;
  trimDuration: number;
  trimStart: number;
  trimEnd: number;
  maxDuration: number;
}

const initialState = {
  isScrubbingTrim: false,
  trimDuration: 3,
  trimStart: 0,
  trimEnd: 0,
  maxDuration: 0,
}

export default function VideoQuickTrim({
  onChange,
  ...rest
}: VideoQuickTrimProps){
  console.log("Rerender!!");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTimePortion, setCurretTimePortion] = useState<number>(0);
  const videoRefCallback = useCallback(node => {
    if (node !== null) { 
      // DOM node referenced by ref has changed and exists
      videoRef.current = node;
      node.ontimeupdate = (e: PointerEvent)=>{
        console.log(`${node.currentTime}/${node.duration}  ${node.currentTime / node.duration}`);
        setCurretTimePortion(
          fractionToPercentage(node.currentTime / node.duration)
        );
      }
    } else {
      // DOM node referenced by ref has been unmounted
    }
  }, []); //END videoRefCallback

  const trimZoneRef = useRef<HTMLDivElement>(null);
  const playbarRef = useRef<HTMLDivElement>(null);
  const [playpause, setPlaypause] = useState<'playing'|'paused'|'stopped'>('paused');
  const [{
    trimDuration,
    isScrubbingTrim,
  }, setState] = useState<TrimState>(initialState);

  const handleChangeTrimDuration = (newTrim: number) =>{
    setState((curr)=>({
      ...curr,
      trimDuration: newTrim,
      trimEnd: curr.trimStart+ newTrim,
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
          ref={videoRefCallback}
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
     
        <div className="playbar" ref={playbarRef}>
          <div className="trimzone" 
            ref={trimZoneRef}
            style={{width: (
              videoRef.current ? 
                (trimDuration / videoRef.current.duration * 100) 
                : 0
            ) + "%"}}
            onPointerDown={()=>{
              if(trimZoneRef.current){
                trimZoneRef.current.style.cursor = 'grabbing';
                setState((curr)=>({
                  ...curr,
                  isScrubbingTrim: true,
                }))
              }
            }}
            onPointerUp={()=>{
              if(trimZoneRef.current) {
                trimZoneRef.current.style.cursor = 'grab';
                setState((curr)=>({
                  ...curr,
                  isScrubbingTrim: true,
                }));
              }
            }}
            onPointerMove={(e: PointerEvent<HTMLDivElement>)=>{
              if(trimZoneRef.current && playbarRef.current && isScrubbingTrim){
                console.log(fractionToPercentage(
                  (e.clientX - trimZoneRef.current.getBoundingClientRect().left) / playbarRef.current.getBoundingClientRect().width
                ) + "%");
              }
            }}
          />
          <div className="playcursor" style={{left: currentTimePortion+"%"}}/>
        </div> {/* END of Playbar */}
      </div>{/* END of Video Wrapper */}
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