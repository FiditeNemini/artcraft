import React from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useEffect, useState } from 'react';
import { BucketConfig } from '../../../../common/BucketConfig';
import { TtsResult } from '../../../api/tts/GetTtsResult';

interface Props {
  ttsResult: TtsResult,
}

function TtsResultAudioPlayerFc(props: Props) {
  let [isPlaying, setIsPlaying] = useState(false);
  let [waveSurfer, setWaveSurfer] = useState<WaveSurfer|null>(null);

  useEffect(() => {
    setWaveSurfer(WaveSurfer.create({
      container: '#waveform'
    }))
  }, [])

  useEffect(() => {
    const audioLink = new BucketConfig().getGcsUrl(props.ttsResult?.public_bucket_wav_audio_path);
    if(waveSurfer) {
      waveSurfer.load(audioLink)
    }
  }, [waveSurfer, props.ttsResult])

  const togglePlayPause = () => {
    if (waveSurfer) {
      waveSurfer.playPause()
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div>
      <div id="waveform" ></div>
      <button onClick={() => togglePlayPause()}>{isPlaying ? '||' : '+'}</button>
    </div>
  )
}

export { TtsResultAudioPlayerFc }
