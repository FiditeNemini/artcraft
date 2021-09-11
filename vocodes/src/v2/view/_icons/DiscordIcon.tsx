import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

interface Props {
  title?: string,
}

export function DiscordIcon(props: Props) {
  const title = props.title === undefined ? 'Discord' : props.title;
  return (
      <FontAwesomeIcon icon={faDiscord} title={title} />
  );
}

