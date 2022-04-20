import React  from 'react';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  hideIcon?: boolean,
  iconBeforeText?: boolean,
  title?: string,
  children?: string|Element|Array<any>, // Optional link text, child elements, etc.
}

function DiscordLink2(props: Props) {
  let linkBody = props.children === undefined ? 
    <>Discord</> : 
    <>{props.children}</>;

  const showIcon = !(props.hideIcon ? true : false);
  const iconBeforeText = props.iconBeforeText ? true : false;

  const linkTitle = props.title ? props.title : 'FakeYou Discord';

  if (showIcon) {
    linkBody = iconBeforeText ? 
        <><FontAwesomeIcon icon={faDiscord} title={linkTitle}/> {linkBody}</> :
        <>{linkBody} <FontAwesomeIcon icon={faDiscord} title={linkTitle}/></> ;
  }

  return (
    <a href="https://discord.gg/H72KFXm" 
       target="_blank" 
       rel="noopener noreferrer">{linkBody}</a>
  )
}

export { DiscordLink2 };
