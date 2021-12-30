import React  from 'react';
import { DiscordIcon } from '../_icons/DiscordIcon';

interface Props {
  text?: string,
  iconAfterText?: boolean,
}

function DiscordLink(props: Props) {
  const linkText = props.text === undefined ? 'Discord' : props.text;
  const iconAfterText = props.iconAfterText ? true : false;
  const linkBody = iconAfterText ? 
      <>{linkText} <DiscordIcon title={linkText}/></> :
      <><DiscordIcon title={linkText}/> {linkText}</> ;
  return (
    <a href="https://discord.gg/H72KFXm" 
       target="_blank" 
       rel="noopener noreferrer">{linkBody}</a>
  )
}

export { DiscordLink };
