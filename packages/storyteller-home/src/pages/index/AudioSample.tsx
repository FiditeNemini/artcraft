import React, { useRef, useState } from 'react';
import { Howl } from 'howler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

interface Props {
  sampleUrl: string,
}

function AudioSample(props: Props) {

  const [isPlaying, setIsPlaying] = useState(false);

  const howlPlayer = useRef(
    new Howl({
      src: [props.sampleUrl],
      autoplay: false,
      loop: false,
      onplay: function() { setIsPlaying(true) },
      onpause: function() { setIsPlaying(false) },
      onend: function() { setIsPlaying(false) },
    })
  );

  const onClickToggle = () => {
    const player = howlPlayer.current;
    if (player.playing()) {
      player.stop();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }

  const playIcon = isPlaying ? 
    <FontAwesomeIcon icon={faPause} /> :
    <FontAwesomeIcon icon={faPlay} /> ;

  return (
    <button 
      className="button is-info is-rounded is-outlined"
      onClick={onClickToggle}
      >{playIcon}</button>
  );
}

export default AudioSample;
