import { useCallback, useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { faCirclePlay, faCirclePause, } from "@fortawesome/pro-solid-svg-icons"
import { ButtonIcon } from '~/components';

export const WaveformPlayer = ({
  audio
}:{
  audio: string
}) => {
  const waveSurferRef = useRef<WaveSurfer | undefined>(undefined);
  const [isPlaying, toggleIsPlaying] = useState(false);

  const containerRef = useCallback((node:HTMLDivElement)=>{
    if(node){
      const waveSurfer = WaveSurfer.create({
        container: node,
        barWidth: 2,
        height: 30,
        cursorWidth: 0,
      });
      waveSurfer.load(audio);
      waveSurfer.on('ready', () => {
        waveSurferRef.current = waveSurfer;
      });
      waveSurfer.on('play', () => {
        toggleIsPlaying(true);
      });
      waveSurfer.on('pause', () => {
        toggleIsPlaying(false);
      });
    }
  }, []);

  useEffect(()=>{
    return()=>{
      console.log("OK?");
      waveSurferRef.current?.destroy();
    }
  },[]);

  return (
    <div className="flex py-1 gap-2">
      <ButtonIcon
        icon={isPlaying ? faCirclePause : faCirclePlay}
        size="2x"
        onClick={() => {
          waveSurferRef.current?.playPause();
        }}
      />
      <div ref={containerRef} className="w-full h-10"/>
    </div>
  );
};
