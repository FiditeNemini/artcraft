import React, {
  memo,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import {
  faPlay,
  faPause,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useLocalize } from "hooks";
import { VideoFakeyou } from "components/common";
import { VideoFakeyouProps } from "../VideoFakeyou/VideoFakeyou";

import {
  reducer,
  initialState,
  ACTION_TYPES,
  PLAYPUASE_STATES,
  STATE_STATUSES,
} from "./reducer";

import { QuickTrimData, ONE_MS } from "./utilities";

import { ProgressBar } from "./components/ProgressBar";
import { ControlBar } from "./components/ControlBar";
import './styles.scss'

interface VideoQuickTrimProps extends VideoFakeyouProps {
  debug?: boolean
  onSelect: (values: QuickTrimData) => void;
  trimStartSeconds: number;
  trimEndSeconds: number;
}

export const VideoQuickTrim = memo(({
  debug: propsDebug = false,
  onSelect,
  trimStartSeconds: propsTrimStartSeconds,
  trimEndSeconds : propsTrimEndSeconds,
  ...rest
}: VideoQuickTrimProps) => {
  const debug = true || propsDebug;

  const { t } = useLocalize("VideoPlayerQuickTrim");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [compState, dispatchCompState] = useReducer(reducer, initialState);
  
  if(compState.status === STATE_STATUSES.LOAD_ORDER_ERROR){
    console.log(`${compState.errorMessage[compState.errorMessage.length -1]}`);
  }

  const videoRefCallback = useCallback(node => {
    function setPlaypause(newState: PLAYPUASE_STATES){
      dispatchCompState({
        type: ACTION_TYPES.SET_PLAYPUASE,
        payload: { playpause: newState}
      })
    }
    if (node !== null) { 
      // DOM node referenced by ref has changed and exists
      videoRef.current = node;
      node.onloadedmetadata = ()=>{
        dispatchCompState({
          type: ACTION_TYPES.ON_LOADED_METADATA,
          payload:{ videoDuration: node.duration,}
        });
      };

      node.ontimeupdate = ()=>{
        if(compState.trimStartSeconds !== undefined && 
          compState.trimEndSeconds !== undefined && 
          compState.playbarWidth !== undefined){
          // reset current time when on repeat
          if(compState.isRepeatOn && 
            (node.currentTime > compState.trimEndSeconds || node.currentTime < compState.trimStartSeconds)
          ){
            node.currentTime = compState.trimStartSeconds + ONE_MS;
            // if (debug){
            //   console.log(`Loop Playing trimStart@${compState.trimStartSeconds}`);
            //   console.log(`Loop Playing currentTime@${node.currentTime}`);
            // }
          }

          dispatchCompState({
            type: ACTION_TYPES.MOVE_TIMECURSOR,
            payload: {
              timeCursorOffset: (node.currentTime / node.duration) * (compState.playbarWidth)
            }
          });
        }else{
          console.log('ontimeupdate failed');
        }
      };

      node.onplay = ()=>setPlaypause(PLAYPUASE_STATES.PLAYING);
      node.onpause = ()=>setPlaypause(PLAYPUASE_STATES.PAUSED);
      node.onended = ()=>setPlaypause(PLAYPUASE_STATES.ENDED);

      node.onprogress = ()=>{
        console.log(node.buffered);
        if(node.buffered.length > 0){
          dispatchCompState({
            type: ACTION_TYPES.SET_VIDEO_LOAD_PROGRESS,
            payload: {videoLoadProgress: node.buffered}
          });
        }
      }
    } // else{} DOM node referenced by ref has been unmounted 
  }, [
    compState.trimStartSeconds, 
    compState.trimEndSeconds,
    compState.playbarWidth,
    compState.isRepeatOn
  ]); //END videoRefCallback\

  useEffect(()=>{
    if( compState.trimStartSeconds !== undefined
      && compState.trimEndSeconds !== undefined
      && (
        compState.trimStartSeconds !== propsTrimStartSeconds
        || compState.trimEndSeconds !== propsTrimEndSeconds
      )
    ){
      console.log(`TRIM on useEFFECT: calling onSELECT`);
      onSelect({
        trimStartSeconds: compState.trimStartSeconds,
        trimEndSeconds: compState.trimEndSeconds,
      });
    }
  }, [onSelect, compState.trimStartSeconds, compState.trimEndSeconds, propsTrimStartSeconds, propsTrimEndSeconds])

  function videoCanPlay(){
    return (compState.playpause === PLAYPUASE_STATES.PAUSED 
      || compState.playpause === PLAYPUASE_STATES.ENDED
      || compState.playpause === PLAYPUASE_STATES.READY
    );
  }
  function handlePlaypause(){
    if (videoCanPlay()){
      videoRef.current?.play();
    }else if (compState.playpause === PLAYPUASE_STATES.PLAYING){
      videoRef.current?.pause();
    }else {
      console.log('Playpause is triggered while it is NOT_READY');
    }
  };
  function disableRepeatOn(){
    dispatchCompState({
      type: ACTION_TYPES.TOGGLE_REPEAT,
      payload: {isRepeatOn: false}
    });
  }
  return (
    <div className="fy-video-quicktrim">
      <div className="video-wrapper">
        <VideoFakeyou
          debug={false}
          height={500}
          controls={false}
          muted={compState.isMuted}
          ref={videoRefCallback}
          {...rest}
        />
        {compState.playpause !== PLAYPUASE_STATES.NOT_READY &&
          <div className="playpause-overlay" onClick={handlePlaypause}>
            {videoCanPlay() && (
              <FontAwesomeIcon
                className="playpause-icon"
                icon={faPlay}
                size="8x"
              />
            )}
            {compState.playpause === PLAYPUASE_STATES.PLAYING && (
              <FontAwesomeIcon
                className="playpause-icon"
                icon={faPause}
                size="8x"
              />
            )}
          </div>
        }
        { compState.canNotTrim === true &&
          <div className="warning-too-short">
            <div className="background"></div>
            <h1>{t('error.videoTooShort')}</h1>
          </div>
        }
      </div>{/* END of Video Wrapper */}
      <ProgressBar
        debug={debug}
        readyToMount={(compState.status === STATE_STATUSES.VIDEO_METADATA_LOADED)}
        timeCursorOffset={compState.timeCursorOffset ||0}
        trimStartSeconds={compState.trimStartSeconds ||0}
        trimDuration={compState.trimDuration ||0}
        playbarWidth={compState.playbarWidth ||0}
        scrubberWidth={compState.scrubberWidth ||0}
        videoBuffered={compState.videoLoadProgress || undefined}
        videoDuration={compState.videoDuration ||0}
        dispatchCompState={dispatchCompState}
        onPlayCursorChanged={(newPos: number)=>{
          if(videoRef.current !== null && videoRef.current.currentTime
            && compState.playbarWidth && compState.videoDuration){
            const newTime = newPos / compState.playbarWidth * compState.videoDuration;
            if(compState.trimStartSeconds
              && compState.trimEndSeconds
              && (newTime < compState.trimStartSeconds
                || newTime > compState.trimEndSeconds
              )){
                disableRepeatOn();
            }
            videoRef.current.currentTime = newTime;
          }
        }}
      />
      <ControlBar
        debug={debug}
        readyToMount={(compState.status === STATE_STATUSES.VIDEO_METADATA_LOADED)}
        videoCurrentTime={videoRef.current?.currentTime}
        videoDuration={videoRef.current?.duration}
        isMuted={compState.isMuted}
        isRepeatOn={compState.isRepeatOn}
        playpause={compState.playpause}
        handlePlaypause={handlePlaypause}
        dispatchCompState={dispatchCompState}
      />
    </div>
  );
});
