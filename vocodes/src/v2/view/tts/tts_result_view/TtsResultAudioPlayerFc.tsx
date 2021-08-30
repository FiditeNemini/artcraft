import React, { useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useEffect, useState } from 'react';
import { BucketConfig } from '../../../../common/BucketConfig';
import { TtsResult } from '../../../api/tts/GetTtsResult';
import { PlayIcon } from '../../_icons/PlayIcon';
import { PauseIcon } from '../../_icons/PauseIcon';
import { RepeatIcon } from '../../_icons/RepeatIcon';
import { ArrowRightIcon } from '../../_icons/ArrowRightIcon';

interface Props {
  ttsResult: TtsResult,
}

//function useIsLooping() : [boolean, () => void] {
//  const [isLooping, setLooping] = useState(false)
//  const toggleLooping = useCallback(() => setLooping(() => !isLooping), [])
//  return [ isLooping, toggleLooping ]
//}

function TtsResultAudioPlayerFc(props: Props) {
  let [isPlaying, setIsPlaying] = useState(false);
  let [isRepeating, setIsRepeating] = useState(false);
  let [waveSurfer, setWaveSurfer] = useState<WaveSurfer|null>(null);

  //let [isLooping, toggleLooping] = useIsLooping();

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


    //wavesurferInstance.on('finish', () => repeatCallback());

    setWaveSurfer(wavesurferInstance);
  }, [])
  
  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(props.ttsResult?.public_bucket_wav_audio_path);
    if(waveSurfer) {
      waveSurfer.load(audioLink)
    }
  }, [waveSurfer, props.ttsResult])

  const repeat = useCallback(() => {
    console.log('repeat callback', isRepeating);
    if (waveSurfer && isRepeating) {
      waveSurfer!.play();
    }
  }, [waveSurfer, isRepeating]);

  useEffect(() => {
    console.log('isLooping', isRepeating);
    if (waveSurfer) {
      waveSurfer.unAll();
      waveSurfer.on('pause', () => {
        setIsPlaying(false);
      })
      waveSurfer.on('finish', repeat);
    }
  }, [waveSurfer, isRepeating, repeat])

  const togglePlayPause = () => {
    if (waveSurfer) {
      waveSurfer.playPause();
      setIsPlaying(!isPlaying)
    }
  }

  const toggleIsRepeating = () => {
    console.log('toggleIsRepeating')
    setIsRepeating(!isRepeating)
    //toggleLooping();
  }


  let playButtonText = <><PlayIcon /></>;
  if (isPlaying) {
    playButtonText = <><PauseIcon /></>;
  }

  let repeatButtonText = isRepeating ? <RepeatIcon /> : <ArrowRightIcon />;

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
      </div>
      </div>
    </div>
  )
}

export { TtsResultAudioPlayerFc }
