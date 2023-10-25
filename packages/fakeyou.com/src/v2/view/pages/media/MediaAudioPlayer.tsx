import React from "react";
import WaveSurfer from "wavesurfer.js";
import { useEffect, useState } from "react";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import {
  faPlay,
  faPause,
  faRepeat,
  faArrowRight,
} from "@fortawesome/pro-solid-svg-icons";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import Button from "components/common/Button";

enum PlaybackSpeed {
  HALF,
  NORMAL,
  DOUBLE,
}

interface MediaAudioPlayerProps {
  mediaFile: MediaFile;
}

export default function MediaAudioPlayer({ mediaFile }: MediaAudioPlayerProps) {
  let [isPlaying, setIsPlaying] = useState(false);
  let [isRepeating, setIsRepeating] = useState(false);
  let [playbackSpeed, setPlaybackSpeed] = useState(PlaybackSpeed.NORMAL);
  let [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);

  useEffect(() => {
    const wavesurferInstance = WaveSurfer.create({
      container: "#waveform", // Previousy I used 'this.ref.current' and React.createRef()
      height: 200,
      responsive: true,
      waveColor: "#cbcbcb",
      progressColor: "#fc8481",
      cursorColor: "#fc6b68",
      cursorWidth: 2,
      normalize: true,
    });

    setWaveSurfer(wavesurferInstance);
  }, []);

  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(
      mediaFile.public_bucket_path
    );
    if (waveSurfer) {
      waveSurfer.load(audioLink);
    }
  }, [waveSurfer, mediaFile]);

  useEffect(() => {
    if (waveSurfer) {
      waveSurfer.unAll(); // NB: Otherwise we keep reinstalling the hooks and cause chaos
      waveSurfer.on("pause", () => {
        setIsPlaying(waveSurfer!.isPlaying());
      });
      waveSurfer.on("play", () => {
        setIsPlaying(waveSurfer!.isPlaying());
      });
      waveSurfer.on("finish", () => {
        if (waveSurfer && isRepeating) {
          waveSurfer!.play();
        }
      });
    }
  }, [waveSurfer, isRepeating]);

  const togglePlayPause = () => {
    if (waveSurfer) {
      waveSurfer.playPause();
    }
  };

  const toggleIsRepeating = () => {
    setIsRepeating(!isRepeating);
  };

  const togglePlaybackSpeed = () => {
    let nextSpeed = PlaybackSpeed.NORMAL;
    switch (playbackSpeed) {
      case PlaybackSpeed.NORMAL:
        nextSpeed = PlaybackSpeed.DOUBLE;
        waveSurfer!.setPlaybackRate(1.5); // Okay, so a lie...
        break;
      case PlaybackSpeed.DOUBLE:
        nextSpeed = PlaybackSpeed.HALF;
        waveSurfer!.setPlaybackRate(0.5);
        break;
      case PlaybackSpeed.HALF:
        nextSpeed = PlaybackSpeed.NORMAL;
        waveSurfer!.setPlaybackRate(1.0);
        break;
    }
    setPlaybackSpeed(nextSpeed);
  };

  let playButtonIcon = faPlay;
  if (isPlaying) {
    playButtonIcon = faPause;
  }

  let repeatButtonIcon = isRepeating ? faRepeat : faArrowRight;

  let speedButtonText = "1x";
  switch (playbackSpeed) {
    case PlaybackSpeed.NORMAL:
      speedButtonText = "1x";
      break;
    case PlaybackSpeed.DOUBLE:
      speedButtonText = "2x";
      break;
    case PlaybackSpeed.HALF:
      speedButtonText = "0.5x";
      break;
  }

  return (
    <div>
      <div id="waveform"></div>
      <div className="d-flex justify-content-center gap-2 mt-3">
        <Button
          square={true}
          icon={playButtonIcon}
          onClick={() => togglePlayPause()}
        />

        <Button
          tooltip="Toggle Repeat"
          variant="secondary"
          square={true}
          icon={repeatButtonIcon}
          onClick={() => toggleIsRepeating()}
        />

        <Button
          tooltip="Speed"
          label={speedButtonText}
          variant="secondary"
          onClick={() => togglePlaybackSpeed()}
        />
      </div>
    </div>
  );
}
