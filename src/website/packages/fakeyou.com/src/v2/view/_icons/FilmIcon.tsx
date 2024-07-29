import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title?: string,
}

export function FilmIcon(props: Props) {
  return (
      <FontAwesomeIcon icon={faFilm} title={props.title} />
  );
}

