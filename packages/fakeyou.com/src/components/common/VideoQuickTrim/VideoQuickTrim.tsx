import React, {
  useCallback,
  useState,
  useRef,
  PointerEvent
} from "react";
import {
  faPlay,
  faPause
} from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  SelectionBubbles,
  VideoFakeyou
} from "components/common";
import { VideoFakeyouProps } from "../VideoFakeyou/VideoFakeyou";

import './styles.scss'

function roundTo2Dec(floaty:number){
  return Math.round(floaty*100)/100;
}
function fractionToPercentage(fraction:number){
  return roundTo2Dec(fraction * 100);
}
function formatSecondsToHHMMSS(seconds:number){
  if(seconds < 3600) 
    return new Date(seconds * 1000).toISOString().substring(14, 19)
  else
    return new Date(seconds * 1000).toISOString().slice(11, 19);
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

  const trimOptions: { [key: string]: number } = {
    "3s": 3,
    "5s": 5,
    "10s": 10,
    "15s" : 15,
    "20s" : 20,
  };
  const trimZoneRef = useRef<HTMLDivElement>(null);
  const playbarRef = useRef<HTMLDivElement>(null);
  const [playpause, setPlaypause] = useState<'playing'|'paused'|'stopped'>('paused');
  const [{
    trimDuration,
    isScrubbingTrim,
  }, setState] = useState<TrimState>(initialState);

  const handleChangeTrimDuration = (selected: string) =>{
    setState((curr)=>({
      ...curr,
      trimDuration: trimOptions[selected],
      trimEnd: curr.trimStart+ trimOptions[selected],
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
      </div>{/* END of Video Wrapper */}
      <div className="playbar" ref={playbarRef}>
        <div className="playbar-bg" />
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
                (e.clientX - trimZoneRef.current.getBoundingClientRect().left) / (playbarRef.current.getBoundingClientRect().width)
              ) + "%");
            }
          }}
        />
        <div className="playcursor" style={{left: currentTimePortion+"%"}}/>
      </div> {/* END of Playbar */}

      <div className="d-flex w-100 justify-content-between mt-3 flex-wrap">
        <div className="playpause-external d-flex align-items-center flex-wrap mb-2">
          <Button
            icon={playpause === 'playing' ? faPause : faPlay}
            variant="secondary"
            onClick={handlePlaypause}
          />
          <div className="playtime ms-3">
            <p>{`${formatSecondsToHHMMSS(videoRef.current?.currentTime || 0)} / ${formatSecondsToHHMMSS(videoRef.current?.duration || 0)}`}</p>
          </div>
        </div>
        <SelectionBubbles
          options={Object.keys(trimOptions)}
          onSelect={handleChangeTrimDuration}
        />
      </div>
    </div>
  );
}