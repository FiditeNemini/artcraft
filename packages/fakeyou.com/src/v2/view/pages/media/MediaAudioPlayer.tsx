import React from "react";
import WaveSurfer from "wavesurfer.js";
import { useEffect, useState } from "react";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/pro-solid-svg-icons";
import MediaData from "./MediaDataTypes";

enum PlaybackSpeed {
  HALF,
  NORMAL,
  DOUBLE,
}

interface MediaAudioPlayerProps {
  mediaData: MediaData;
}

export default function MediaAudioPlayer({ mediaData }: MediaAudioPlayerProps) {
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
      normalize: false,
    });

    setWaveSurfer(wavesurferInstance);
  }, []);

  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(
      mediaData.public_bucket_path
    );
    if (waveSurfer) {
      waveSurfer.load(audioLink);
    }
  }, [waveSurfer, mediaData]);

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

  let playButtonText = (
    <>
      <FontAwesomeIcon icon={faPlay} />
    </>
  );
  if (isPlaying) {
    playButtonText = (
      <>
        <FontAwesomeIcon icon={faPause} />
      </>
    );
  }

  let repeatButtonText = isRepeating ? "Repeat" : "NoRepeat";

  let speedButtonText = "1x";
  switch (playbackSpeed) {
    case PlaybackSpeed.NORMAL:
      speedButtonText = "1x";
      break;
    case PlaybackSpeed.DOUBLE:
      speedButtonText = "2x";
      break;
    case PlaybackSpeed.HALF:
      speedButtonText = "1/2x";
      break;
  }

  return (
    <div>
      <div id="waveform"></div>
      <div className="d-flex gap-4 flex-column justify-content-center align-items-center mt-4">
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => togglePlayPause()}>
            {playButtonText}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => toggleIsRepeating()}
          >
            {repeatButtonText}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => togglePlaybackSpeed()}
          >
            {speedButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
