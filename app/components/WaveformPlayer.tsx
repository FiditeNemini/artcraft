import { useCallback, useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { faCirclePlay, faCirclePause } from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";

export const WaveformPlayer = ({ audio }: { audio: string }) => {
  const waveSurferRef = useRef<WaveSurfer | undefined>(undefined);
  const [isPlaying, toggleIsPlaying] = useState(false);

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
      waveSurfer.load(audio);
      waveSurfer.on("ready", () => {
        waveSurferRef.current = waveSurfer;
      });
      waveSurfer.on("play", () => {
        toggleIsPlaying(true);
      });
      waveSurfer.on("pause", () => {
        toggleIsPlaying(false);
      });
      waveSurfer.on("finish", () => {
        waveSurfer.seekTo(0);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      //destructor on unmount
      waveSurferRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 py-1">
      <ButtonIcon
        icon={isPlaying ? faCirclePause : faCirclePlay}
        className="w-auto bg-transparent p-0 text-2xl hover:bg-transparent hover:opacity-75"
        onClick={() => {
          waveSurferRef.current?.playPause();
        }}
      />
      <div ref={containerRef} className="w-full" />
    </div>
  );
};
