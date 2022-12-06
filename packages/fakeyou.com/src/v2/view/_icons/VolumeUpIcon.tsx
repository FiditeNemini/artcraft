import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title?: string,
}

export function VolumeUpIcon(props: Props) {
  return (
      <FontAwesomeIcon icon={faVolumeUp} title={props.title} />
  );
}

