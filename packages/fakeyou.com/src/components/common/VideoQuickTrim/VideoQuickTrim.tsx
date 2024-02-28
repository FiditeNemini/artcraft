import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
  PointerEvent,
} from "react";
import {
  faPlay,
  faPause,
  faGripDots,
  faVolume,
  faVolumeSlash,
} from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  SelectionBubbles,
  VideoFakeyou
} from "components/common";
import { VideoFakeyouProps } from "../VideoFakeyou/VideoFakeyou";

import { QuickTrimData, TrimStates, PlaybarStates } from "./types";
import { formatSecondsToHHMMSSCS } from "./helpers";
import './styles.scss'

interface VideoQuickTrimProps extends VideoFakeyouProps{
  onSelect: (values: QuickTrimData)=>void;
}

const trimOptions: { [key: string]: number } = {
  "3s": 3,
  "5s": 5,
  "10s": 10,
  "15s" : 15,
};

const initialTrimState:TrimStates = {
  isScrubbingTrim: false,
  trimDuration: 3,
  trimStart: 0,
  trimEnd: 0,
  maxDuration: 0,
}

const initialPlaybarState:PlaybarStates = {
  playbarWidth: 0,
  timeCursorOffset: 0,
}

export default memo(function VideoQuickTrim({
  onSelect,
  ...rest
}: VideoQuickTrimProps){
  console.log("VideoQuickTrim Rerender!!");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbarRef = useRef<HTMLDivElement | null>(null);
  const trimZoneRef = useRef<HTMLDivElement>(null);

  const [{playbarWidth, timeCursorOffset}, setPlaybarState] = useState<PlaybarStates>(initialPlaybarState);
  const [playpause, setPlaypause] = useState<'playing'|'paused'|'stopped'>('paused');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [{
    trimStart,
    trimEnd,
    trimDuration,
    isScrubbingTrim,
  }, setTrimState] = useState<TrimStates>(initialTrimState);
  


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
    setTrimState((curr)=>({
      ...curr,
      trimDuration: trimOptions[selected],
      trimEnd: trimStart+ trimOptions[selected],
    }))
    onSelect({
      trimStartSeconds: trimStart,
      trimEndSeconds: trimStart+ trimOptions[selected],
    });
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
          muted={isMuted}
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
              setTrimState((curr)=>({
                ...curr,
                isScrubbingTrim: true,
              }))
            }
          }}
          onPointerUp={()=>{
            if(trimZoneRef.current) {
              trimZoneRef.current.style.cursor = 'grab';
              setTrimState((curr)=>({
                ...curr,
                isScrubbingTrim: false,
              }));
            }
          }}
          onPointerMove={(e: PointerEvent<HTMLDivElement>)=>{
            if(trimZoneRef.current && playbarRef.current && isScrubbingTrim){
              // console.log(fractionToPercentage(
              //   (e.clientX - trimZoneRef.current.getBoundingClientRect().left) / (playbarRef.current.getBoundingClientRect().width)
              // ) + "%");
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
            className="button-playpause"
            icon={playpause === 'playing' ? faPause : faPlay}
            variant="secondary"
            onClick={handlePlaypause}
          />
          <Button
            className="button-mute"
            icon={isMuted ? faVolumeSlash : faVolume}
            variant="secondary"
            onClick={()=>setIsMuted((curr)=>(!curr))}
          />
          <div className="playtime ms-2 d-flex">
            <span >
              <p>
                {`${formatSecondsToHHMMSSCS(videoRef.current?.currentTime || 0)}`}
              </p>
            </span>
            <div>/</div>
            <span>
              <p>
                {`${formatSecondsToHHMMSSCS(videoRef.current?.duration || 0)}`}
              </p>
            </span>
          </div>
        </div>
        <SelectionBubbles
          options={Object.keys(trimOptions)}
          onSelect={handleChangeTrimDuration}
        />
      </div>
    </div>
  );
});
