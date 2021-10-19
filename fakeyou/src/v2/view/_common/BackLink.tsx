import React  from 'react';
import { Link } from 'react-router-dom';
import { BackButtonIcon } from '../_icons/BackButtonIcon';

interface Props {
  link: string,
  text?: string,
}

function BackLink(props: Props) {
  const linkText = props.text === undefined ? 'Back' : props.text;
  return (
    <Link to={props.link}><BackButtonIcon title={linkText} /> {linkText}</Link>
  )
}

export { BackLink };
