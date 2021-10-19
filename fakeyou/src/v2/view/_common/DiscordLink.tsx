import React  from 'react';
import { DiscordIcon } from '../_icons/DiscordIcon';

interface Props {
  text?: string,
}

function DiscordLink(props: Props) {
  const linkText = props.text === undefined ? 'Discord' : props.text;
  return (
    <a href="https://discord.gg/H72KFXm" 
       target="_blank" 
       rel="noopener noreferrer"><DiscordIcon title={linkText}/> {linkText}</a>
  )
}

export { DiscordLink };
