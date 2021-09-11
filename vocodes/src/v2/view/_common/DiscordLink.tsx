import React  from 'react';

interface Props {
  text?: string,
}

function DiscordLink(props: Props) {
  const linkText = props.text === undefined ? 'Discord' : props.text;
  return (
    <a href="https://discord.gg/H72KFXm" 
       target="_blank" 
       rel="noopener noreferrer">{linkText}</a>
  )
}

export { DiscordLink };
