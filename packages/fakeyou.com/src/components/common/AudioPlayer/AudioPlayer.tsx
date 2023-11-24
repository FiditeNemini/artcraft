import React, { useEffect, useState, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { faPlay, faPause } from "@fortawesome/pro-solid-svg-icons";
import Button from "components/common/Button";

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(src);

    if (!waveSurferRef.current && waveformRef.current) {
      const wavesurferInstance = WaveSurfer.create({
        container: waveformRef.current,
        height: 38,
        responsive: true,
        waveColor: "#cbcbcb",
        progressColor: "#fc8481",
        cursorColor: "#fc6b68",
        cursorWidth: 2,
        normalize: true,
      });

      waveSurferRef.current = wavesurferInstance;

      waveSurferRef.current.load(audioLink);

      waveSurferRef.current.on("pause", () => {
        setIsPlaying(false);
      });

      waveSurferRef.current.on("play", () => {
        setIsPlaying(true);
      });

      waveSurferRef.current.on("finish", () => {
        waveSurferRef.current?.pause();
      });
    }

    return () => {
      // Cleanup when component unmounts
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
    };
  }, [src]);

  const togglePlayPause = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  };

  const playButtonIcon = isPlaying ? faPause : faPlay;

  return (
    <div className="d-flex gap-3 align-items-center">
      <Button
        square={true}
        icon={playButtonIcon}
        onClick={togglePlayPause}
        small={true}
      />
      <div ref={waveformRef} className="w-100" />
    </div>
  );
}
