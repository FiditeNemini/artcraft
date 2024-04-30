import { useCallback, useEffect, useState, useRef } from "react";
import { twMerge } from "tailwind-merge";
import WaveSurfer from "wavesurfer.js";
import { faCirclePlay, faCirclePause, faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";

import { ButtonIcon } from "~/components";
import { environmentVariables } from "~/store";
import { useSignals } from "@preact/signals-react/runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const WaveformPlayer = ({
  hasPlayButton,
  onLoad,
  audio
}: {
  hasPlayButton?: boolean;
  onLoad?:({duration}:{duration:number})=>void;
  audio: string;
}) => {
  useSignals();
  const waveSurferRef = useRef<WaveSurfer | undefined>(undefined);
  const [{isPlaying, isLoading}, setState] = useState<{
    isLoading:boolean;
    isPlaying:boolean;
  }>({
    isLoading: true,
    isPlaying: false,
  });

  const containerRef = useCallback((node: HTMLDivElement) => {
    const toggleIsPlaying = (newIsPlaying:boolean)=>{
      setState((curr)=>({...curr, isPlaying:newIsPlaying}));
    }
    const toggleIsLoading = (newIsLoading:boolean)=>{
      setState((curr)=>({...curr, isLoading:newIsLoading}));
    }
    if (node) {
      if(waveSurferRef.current){
        //need to destroy previous wavesurfer to not have doubles
        waveSurferRef.current.destroy();
        toggleIsLoading(true);
      }
      const waveSurfer = WaveSurfer.create({
        container: node,
        barWidth: 2,
        height: 24,
        cursorWidth: 0,
        waveColor: "#D7C8C8",
        progressColor: "#FB8381",
      });
      const newUrl = audio.replace(
        "https://storage.googleapis.com",
        environmentVariables.value.GOOGLE_API,
      );

      waveSurfer.load(newUrl);
      waveSurfer.on("ready", () => {
        waveSurferRef.current = waveSurfer;
        // console.log("here");
        toggleIsLoading(false);
        if(onLoad) onLoad({duration: waveSurfer.getDuration()});
      });
      waveSurfer.on("play", () => {
        toggleIsPlaying(true);
      });
      waveSurfer.on("pause", () => {
        toggleIsPlaying(false);
      });
    }
  }, [audio]);

  useEffect(() => {
    return () => {
      //destructor on unmount
      waveSurferRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 py-1">

      {hasPlayButton &&
        <ButtonIcon
          icon={
            isLoading ? faSpinnerThird :
            isPlaying ? faCirclePause : faCirclePlay
          }
          className="w-auto bg-transparent p-0 text-2xl hover:bg-transparent hover:opacity-75"
          spin={isLoading}
          onClick={() => {
            if (!isLoading) waveSurferRef.current?.playPause();
          }}
        />
      }

      <div className="grow relative h-10 overflow-hidden">
        <span className={ twMerge(
          "absolute w-full border-t-white border-t border-dotted top-[18px] transition-opacity",
          isLoading ? "opacity-100" : "opacity-0"
        )}/>
        <div
          ref={containerRef}
          className={twMerge(
            "absolute w-full top-[7px] transition-opacity",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      </div>
    </div>
  );
};
