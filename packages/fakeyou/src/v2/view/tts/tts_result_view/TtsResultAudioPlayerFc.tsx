import React from "react";
import WaveSurfer from "wavesurfer.js";
import { useEffect, useState } from "react";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { TtsResult } from "../../../api/tts/GetTtsResult";
import { PlayIcon } from "../../_icons/PlayIcon";
import { PauseIcon } from "../../_icons/PauseIcon";
import { RepeatIcon } from "../../_icons/RepeatIcon";
import { NoRepeatIcon } from "../../_icons/NoRepeatIcon";

enum PlaybackSpeed {
  HALF,
  NORMAL,
  DOUBLE,
}

interface Props {
  ttsResult: TtsResult;
}

function TtsResultAudioPlayerFc(props: Props) {
  let [isPlaying, setIsPlaying] = useState(false);
  let [isRepeating, setIsRepeating] = useState(false);
  let [playbackSpeed, setPlaybackSpeed] = useState(PlaybackSpeed.NORMAL);
  let [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);

  useEffect(() => {
    const wavesurferInstance = WaveSurfer.create({
      container: "#waveform", // Previousy I used 'this.ref.current' and React.createRef()
      height: 200,
      responsive: true,
      waveColor: "#777",
      progressColor: "#ccc",
      cursorColor: "#3273dc",
      cursorWidth: 2,
      normalize: false,
    });

    setWaveSurfer(wavesurferInstance);
  }, []);

  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(
      props.ttsResult?.public_bucket_wav_audio_path
    );
    if (waveSurfer) {
      waveSurfer.load(audioLink);
    }
  }, [waveSurfer, props.ttsResult]);

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
      <PlayIcon />
    </>
  );
  if (isPlaying) {
    playButtonText = (
      <>
        <PauseIcon />
      </>
    );
  }

  let repeatButtonText = isRepeating ? (
    <RepeatIcon title="Disable repeat" />
  ) : (
    <NoRepeatIcon title="Enable repeat" />
  );

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

export { TtsResultAudioPlayerFc };
