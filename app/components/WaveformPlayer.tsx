import { useCallback, useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { faCirclePlay, faCirclePause } from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";
import { environmentVariables } from "~/store";
import { useSignals } from "@preact/signals-react/runtime";

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
  const [isPlaying, toggleIsPlaying] = useState<boolean>(false);

  const containerRef = useCallback((node: HTMLDivElement) => {
    if (node) {
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
        if(waveSurferRef.current){
          waveSurferRef.current.destroy();
        }
        waveSurferRef.current = waveSurfer;
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
          icon={isPlaying ? faCirclePause : faCirclePlay}
          className="w-auto bg-transparent p-0 text-2xl hover:bg-transparent hover:opacity-75"
          onClick={() => {
            waveSurferRef.current?.playPause();
          }}
        />
      }
      <div ref={containerRef} className="grow" />
    </div>
  );
};
