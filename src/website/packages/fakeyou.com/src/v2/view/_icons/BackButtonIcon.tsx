import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title?: string,
}

export function BackButtonIcon(props: Props) {
  return (
      <FontAwesomeIcon icon={faAngleLeft} title={props.title} />
  );
}
