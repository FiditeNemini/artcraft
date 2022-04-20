import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title?: string,
}

export function FileAudioIcon(props: Props) {
  return (
      <FontAwesomeIcon icon={faFileAudio} title={props.title} />
  );
}

