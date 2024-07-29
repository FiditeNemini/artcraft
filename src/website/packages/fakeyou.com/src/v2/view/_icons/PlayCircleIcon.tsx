import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title?: string,
}

export function PlayCircleIcon(props: Props) {
  return (
      <FontAwesomeIcon icon={faPlayCircle} title={props.title} />
  );
}

