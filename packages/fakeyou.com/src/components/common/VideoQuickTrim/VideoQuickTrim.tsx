import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import {
  faArrowsRepeat,
  faPlay,
  faPause,
  faVolume,
  faVolumeSlash,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, SelectionBubbles, VideoFakeyou } from "components/common";
import { VideoFakeyouProps } from "../VideoFakeyou/VideoFakeyou";

import { QuickTrimData, TrimStates, PlaybarStates } from "./types";
import { formatSecondsToHHMMSSCS } from "./helpers";
import {TrimScrubber} from "./TrimScrubber";
import './styles.scss'

interface VideoQuickTrimProps extends VideoFakeyouProps {
  onSelect: (values: QuickTrimData) => void;
}

const trimOptions: { [key: string]: number } = {
  "3s": 3,
  "5s": 5,
  "10s": 10,
  "15s": 15,
};

const initialTrimState: TrimStates = {
  canNotTrim: true,
  trimDuration: 0,
  trimReset: new Date(),
  trimStart: 0,
  trimEnd: 0,
  maxDuration: 0,
};

const initialPlaybarState: PlaybarStates = {
  playbarWidth: 0,
  timeCursorOffset: 0,
};

export default memo(function VideoQuickTrim({
  onSelect,
  ...rest
}: VideoQuickTrimProps) {
  // console.log("VideoQuickTrim Rerender!!");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbarRef = useRef<HTMLDivElement | null>(null);

  const [{
    playbarWidth,
    timeCursorOffset
  }, setPlaybarState] = useState<PlaybarStates>(initialPlaybarState);
  const [playpause, setPlaypause] = useState<'playing'|'paused'|'ended'>('paused');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRepeatOn, setIsRepatOn] = useState<boolean>(true);
  const [{
    canNotTrim,
    trimReset,
    trimStart,
    trimEnd,
    trimDuration,
    maxDuration
  }, setTrimState] = useState<TrimStates>(initialTrimState);
  


  const videoRefCallback = useCallback(node => {
    console.log("videoRefCallback");
    if (node !== null) { 
      // DOM node referenced by ref has changed and exists
      videoRef.current = node;
      
      node.onloadedmetadata = ()=>{
        if (node.duration >= 3){
          setTrimState((curr)=>({
            ...curr,
            canNotTrim: false,
            trimDuration: 3,
            trimEnd: 3,
            maxDuration: node.duration
          }));
          //TODO: this sbould be set in USEEFFECT
          //IFF USEEFFECT starts working again
          onSelect({
            trimStartSeconds: 0,
            trimEndSeconds: 3,
          })
        }
      };
      
      node.ontimeupdate = ()=>{
        if(isRepeatOn && 
            (node.currentTime >= trimEnd || node.currentTime <= trimStart)
          ){
          node.currentTime = trimStart;
        }
        setPlaybarState((curr)=>({
          ...curr,
          timeCursorOffset: (node.currentTime / node.duration) * (playbarWidth-8)
        }));
        
      };

      node.onplay = ()=>{ setPlaypause("playing");};
      node.onpause = ()=>{setPlaypause("paused");};
      node.onended = ()=>{setPlaypause("ended");};

    } // else{} DOM node referenced by ref has been unmounted 
  }, [playbarWidth, onSelect, isRepeatOn, trimStart, trimEnd]); //END videoRefCallback

  function handleWindowResize() {
    if (playbarRef.current !== null) {
      const newWidth = playbarRef.current.getBoundingClientRect().width;
      setPlaybarState(curr => ({
        playbarWidth: newWidth,
        timeCursorOffset:
          (curr.timeCursorOffset / (curr.playbarWidth - 8)) * (newWidth - 8),
      }));
    }
  }
  const playbarRefCallback = useCallback(node => {
    if (node !== null) {
      playbarRef.current = node;
      setPlaybarState(curr => ({
        ...curr,
        playbarWidth: node.getBoundingClientRect().width,
      }));
    }
  }, []);
  useLayoutEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const handleChangeTrimDuration = (selected: string) =>{
    if(!canNotTrim && maxDuration > 0 && trimOptions[selected] <= maxDuration){
      let newTrimStart = trimStart;
      let newTrimEnd = trimStart+ trimOptions[selected];
      if (newTrimEnd > maxDuration){
        newTrimEnd = maxDuration;
        newTrimStart = maxDuration - trimOptions[selected];
      }
      setTrimState((curr)=>({
        ...curr,
        trimReset: new Date(),
        trimDuration: trimOptions[selected],
        trimStart: newTrimStart,
        trimEnd: newTrimEnd,
      }))
      onSelect({
        trimStartSeconds: newTrimStart,
        trimEndSeconds: newTrimEnd,
      });
      if (isRepeatOn 
          && videoRef.current 
          && videoRef.current.currentTime > newTrimEnd
      ){
        videoRef.current.currentTime = newTrimStart;
      }
    }
  }

  const handlePlaypause = ()=>{
    if (playpause === 'paused' || playpause === 'ended'){
      videoRef.current?.play();
    }else{
      videoRef.current?.pause();
    }
  };

  const trimScrubberWidth = videoRef.current && playbarWidth > 0
    ? trimDuration > 0 && trimDuration < videoRef.current.duration 
      ? (trimDuration / videoRef.current.duration * playbarWidth) 
      : playbarWidth
    : 0;

  return (
    <div className="fy-video-quicktrim">
      <div className="video-wrapper">
        <VideoFakeyou
          height={500}
          controls={false}
          muted={isMuted}
          ref={videoRefCallback}
          {...rest}
        />

        <div className="playpause-overlay" onClick={handlePlaypause}>
          {playpause === "paused" && (
            <FontAwesomeIcon
              className="playpause-icon"
              icon={faPlay}
              size="8x"
            />
          )}
          {playpause === "playing" && (
            <FontAwesomeIcon
              className="playpause-icon"
              icon={faPause}
              size="8x"
            />
          )}
        </div>
        {videoRef.current && canNotTrim && (
          <div className="warning-too-short">
            <div className="background"></div>
            <p>Warning: Sorry Your Video is TOO Short</p>
          </div>
        )}
      </div>
      {/* END of Video Wrapper */}
      <div className="playbar" ref={playbarRefCallback}>
        <div className="playbar-bg" />
        {trimScrubberWidth > 0 && 
          playbarWidth > 0 && 
          maxDuration > 0 &&
          <TrimScrubber
            key={trimReset.toString()}
            boundingWidth={playbarWidth}
            scrubberWidth={trimScrubberWidth}
            trimStart={trimStart}
            trimDuration={trimDuration}
            duration={maxDuration}
            onChange={(val: QuickTrimData)=>{
              console.log(val);
              setTrimState((curr)=>({
                ...curr,
                trimStart: val.trimStartSeconds,
                trimEnd: val.trimEndSeconds
              }))
              onSelect({
                trimStartSeconds: val.trimStartSeconds,
                trimEndSeconds: val.trimEndSeconds,
              });
            }}
          />
        }
        <div className="playcursor" style={{left: timeCursorOffset+"px"}}/>
      </div> {/* END of Playbar */}

      <div className="d-flex w-100 justify-content-between mt-3 flex-wrap">
        <div className="playpause-external d-flex align-items-center flex-wrap mb-2">
          <Button
            className="button-playpause"
            icon={playpause === "playing" ? faPause : faPlay}
            variant="secondary"
            onClick={handlePlaypause}
          />
          <Button
            className="button-repeat"
            icon={faArrowsRepeat}
            variant={isRepeatOn ? "primary":"secondary"}
            onClick={()=>setIsRepatOn((curr)=>(!curr))}
          />
          <Button
            className="button-mute"
            icon={isMuted ? faVolumeSlash : faVolume}
            variant="secondary"
            onClick={() => setIsMuted(curr => !curr)}
          />
          <div className="playtime d-flex">
            <span >
              <p>
                {`${formatSecondsToHHMMSSCS(
                  videoRef.current?.currentTime || 0
                )}`}
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
          selectedStyle="outline"
        />
      </div>
    </div>
  );
});
