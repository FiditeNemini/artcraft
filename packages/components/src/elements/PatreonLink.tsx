import React  from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPatreon } from '@fortawesome/free-brands-svg-icons';

interface Props {
  text?: string,
  iconAfterText?: boolean,
}

function PatreonLink(props: Props) {
  const linkText = props.text === undefined ? 'Discord' : props.text;
  const iconAfterText = props.iconAfterText ? true : false;
  const linkBody = iconAfterText ? 
      <>{linkText} <FontAwesomeIcon icon={faPatreon} title={linkText} /></> :
      <><FontAwesomeIcon icon={faPatreon} title={linkText}/> {linkText}</> ;
  return (
    <a href="https://www.patreon.com/FakeYou" 
       target="_blank" 
       rel="noopener noreferrer">{linkBody}</a>
  )
}

export { PatreonLink };
