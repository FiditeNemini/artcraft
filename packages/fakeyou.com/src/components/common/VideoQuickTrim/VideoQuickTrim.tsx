import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
  PointerEvent
} from "react";
import {
  faPlay,
  faPause,
  faGripDots
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
export type QuickTrimType = {
  trimStartSeconds: number;
  trimEndSecondds: number;
}

interface VideoQuickTrimProps extends VideoFakeyouProps{
  onSelect: (val: QuickTrimType)=>void;
}

type TrimState = {
  isScrubbingTrim: boolean;
  trimDuration: number;
  trimStart: number;
  trimEnd: number;
  maxDuration: number;
}
const initialTrimState = {
  isScrubbingTrim: false,
  trimDuration: 3,
  trimStart: 0,
  trimEnd: 0,
  maxDuration: 0,
}
type PlaybarState = {
  playbarWidth: number;
  timeCursorOffset: number;
}
const initialPlaybarState = {
  playbarWidth: 0,
  timeCursorOffset: 0,
}

export default function VideoQuickTrim({
  onSelect,
  ...rest
}: VideoQuickTrimProps){
  console.log("Rerender!!");

  const trimOptions: { [key: string]: number } = {
    "3s": 3,
    "5s": 5,
    "10s": 10,
    "15s" : 15,
    "20s" : 20,
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbarRef = useRef<HTMLDivElement | null>(null);
  const trimZoneRef = useRef<HTMLDivElement>(null);

  const [{playbarWidth, timeCursorOffset}, setPlaybarState] = useState<PlaybarState>(initialPlaybarState);
  const [playpause, setPlaypause] = useState<'playing'|'paused'|'stopped'>('paused');
  const [{
    trimDuration,
    isScrubbingTrim,
  }, setState] = useState<TrimState>(initialTrimState);
  


  const videoRefCallback = useCallback(node => {
    if (node !== null) { 
      // DOM node referenced by ref has changed and exists
      videoRef.current = node;
      node.ontimeupdate = (e: PointerEvent)=>{
        setPlaybarState((curr)=>({
          ...curr,
          timeCursorOffset: (node.currentTime / node.duration) * (playbarWidth-8)
        }));
      }
    } // else{} DOM node referenced by ref has been unmounted 
  }, [playbarWidth]); //END videoRefCallback

  function handleWindowResize() {
    if(playbarRef.current !== null){
      const newWidth = playbarRef.current.getBoundingClientRect().width;
      setPlaybarState((curr)=>({
        playbarWidth: newWidth,
        timeCursorOffset: (curr.timeCursorOffset / (curr.playbarWidth-8)) * (newWidth-8)
      }));
    }
  }
  const playbarRefCallback = useCallback(node => {
    if(node !== null) {
      playbarRef.current = node;
      setPlaybarState((curr)=>({
        ...curr,
        playbarWidth: node.getBoundingClientRect().width
      }));
    }
  }, []);
  useLayoutEffect(()=>{
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  },[]);

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
      <div className="playbar" ref={playbarRefCallback}>
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
                isScrubbingTrim: false,
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
        >
          <FontAwesomeIcon icon={faGripDots} />
        </div>
        <div className="playcursor" style={{left: timeCursorOffset+"px"}}/>
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