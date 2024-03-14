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
import { VideoElementContext } from "./contexts";

import { QuickTrimData } from "./utilities";

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
  const [compState, dispatchCompState] = useReducer(reducer, initialState);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    // No Dependency !
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

  const togglePlaypause = useCallback(()=>{
    if (videoRef.current === null){
      console.log('Playpause is toggled while it is NOT_READY');
    }else if(videoRef.current.paused){
      videoRef.current.play();
    }else{
      videoRef.current.pause();
    }
  }, []);

  const handlePlaypause = useCallback((shouldPlay: boolean)=>{
    if(videoRef.current){
      if(shouldPlay){
        videoRef.current.play();
      }else {
        videoRef.current.pause();
      }
    }else{
      console.log('Playpause is handled while it is NOT_READY');
    }
  }, []);

  function disableRepeatOn(){
    dispatchCompState({
      type: ACTION_TYPES.TOGGLE_REPEAT,
      payload: {isRepeatOn: false}
    });
  }

  // Refs that should be used to re-render childs are put in context

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
          <div className="playpause-overlay" onClick={togglePlaypause}>
            {videoRef.current !==null && videoRef.current.paused && (
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
      <VideoElementContext.Provider value={videoRef.current}>
        <ProgressBar
          debug={debug}
          readyToMount={(compState.status === STATE_STATUSES.VIDEO_METADATA_LOADED)}
          isRepeatOn={compState.isRepeatOn}
          trimStartSeconds={compState.trimStartSeconds ||0}
          trimEndSeconds={compState.trimEndSeconds ||0}
          trimDuration={compState.trimDuration ||0}
          playbarWidth={compState.playbarWidth ||0}
          scrubberWidth={compState.scrubberWidth ||0}
          videoBuffered={compState.videoLoadProgress || undefined}
          videoDuration={compState.videoDuration ||0}
          handlePlaypause={handlePlaypause}
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
      </VideoElementContext.Provider>
      <ControlBar
        debug={debug}
        readyToMount={(compState.status === STATE_STATUSES.VIDEO_METADATA_LOADED)}
        videoCurrentTime={videoRef.current?.currentTime}
        videoDuration={videoRef.current?.duration}
        isMuted={compState.isMuted}
        isRepeatOn={compState.isRepeatOn}
        playpause={compState.playpause}
        handlePlaypause={togglePlaypause}
        dispatchCompState={dispatchCompState}
      />
    </div>
  );
});
