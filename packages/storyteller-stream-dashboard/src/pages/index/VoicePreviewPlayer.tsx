import React, { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import Wavesurfer from "react-wavesurfer.js";

interface Props {
  filename: string;
  title: string;
}

function VoicePreviewPlayer(props: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  const handleTogglePlay = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleFinish = useCallback(() => {
    setIsPlaying(false);
    setPosition(0);
    return [setIsPlaying, setPosition];
  }, []);

  let playButtonText = <FontAwesomeIcon icon={faPlay} />;

  if (isPlaying) {
    playButtonText = (
      <>
        <FontAwesomeIcon icon={faPause} />
      </>
    );
  }

  return (
    <div className="col-6 col-md-3">
      <div className="panel p-2 p-lg-3">
        <div className="d-flex gap-2 gap-md-3 align-items-center">
          <button
            className="btn btn-primary btn-voice-preview align-items-center justify-content-center"
            onClick={() => handleTogglePlay()}
          >
            {playButtonText}
          </button>
          <span className="fw-semibold voice-preview-text">
            <FontAwesomeIcon icon={faMicrophone} className="me-2" />
            {props.title}
          </span>
        </div>
        <div className="w-100 h-100 mt-4 pb-1 d-none d-lg-block">
          <Wavesurfer
            onFinish={handleFinish}
            pos={position}
            src={props.filename}
            barWidth={2}
            barRadius={1}
            barGap={2}
            barMinHeight={1}
            barHeight={2}
            height={20}
            progressColor="#fc8481"
            waveColor="#b09e9e"
            cursorColor="transparent"
            playing={isPlaying}
            responsive={true}
            normalize={true}
          />
        </div>
      </div>
    </div>
  );
}

export { VoicePreviewPlayer };
