import React from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useEffect, useState } from 'react';
import { BucketConfig } from '../../../../common/BucketConfig';
import { TtsResult } from '../../../api/tts/GetTtsResult';
import { PlayIcon } from '../../_icons/PlayIcon';
import { PauseIcon } from '../../_icons/PauseIcon';
import { RepeatIcon } from '../../_icons/RepeatIcon';
import { ArrowRightIcon } from '../../_icons/ArrowRightIcon';

enum PlaybackSpeed {
  HALF,
  NORMAL,
  DOUBLE,
}

interface Props {
  ttsResult: TtsResult,
}

function TtsResultAudioPlayerFc(props: Props) {
  let [isPlaying, setIsPlaying] = useState(false);
  let [isRepeating, setIsRepeating] = useState(false);
  let [playbackSpeed, setPlaybackSpeed] = useState(PlaybackSpeed.NORMAL);
  let [waveSurfer, setWaveSurfer] = useState<WaveSurfer|null>(null);

  useEffect(() => {
    const wavesurferInstance = WaveSurfer.create({
      container: '#waveform', // Previousy I used 'this.ref.current' and React.createRef()
      height: 200,
      responsive: true,
      waveColor: '#777',
      progressColor:  '#ccc',
      cursorColor: '#3273dc',
      cursorWidth: 2,
      normalize: false,
    });

    setWaveSurfer(wavesurferInstance);
  }, [])
  
  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(props.ttsResult?.public_bucket_wav_audio_path);
    if(waveSurfer) {
      waveSurfer.load(audioLink)
    }
  }, [waveSurfer, props.ttsResult])

  useEffect(() => {
    if (waveSurfer) {
      waveSurfer.unAll(); // NB: Otherwise we keep reinstalling the hooks and cause chaos
      waveSurfer.on('pause', () => {
        setIsPlaying(false);
      })
      waveSurfer.on('finish', () => {
        if (waveSurfer && isRepeating) {
          waveSurfer!.play();
        }
      });
    }
  }, [waveSurfer, isRepeating])

  const togglePlayPause = () => {
    if (waveSurfer) {
      waveSurfer.playPause();
      setIsPlaying(!isPlaying)
    }
  }

  const toggleIsRepeating = () => {
    setIsRepeating(!isRepeating)
  }

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
  }

  let playButtonText = <><PlayIcon /></>;
  if (isPlaying) {
    playButtonText = <><PauseIcon /></>;
  }

  let repeatButtonText = isRepeating ? <RepeatIcon /> : <ArrowRightIcon />;

  let speedButtonText = '1x';
  switch (playbackSpeed) {
    case PlaybackSpeed.NORMAL:
      speedButtonText = '1x';
      break;
    case PlaybackSpeed.DOUBLE:
      speedButtonText = '2x';
      break;
    case PlaybackSpeed.HALF:
      speedButtonText = '1/2x';
      break;
  }

  return (
    <div>
      <div id="waveform"></div>
      <br />
      <div className="columns is-centered">
      <div className="buttons are-medium ">
        <button 
          className="button is-primary is-light"
          onClick={() => togglePlayPause()}>{playButtonText}</button>

        <button 
          className="button is-info is-light"
          onClick={() => toggleIsRepeating()}>{repeatButtonText}</button>

        <button 
          className="button is-info is-light"
          onClick={() => togglePlaybackSpeed()}>{speedButtonText}</button>
      </div>
      </div>
    </div>
  )
}

export { TtsResultAudioPlayerFc }
