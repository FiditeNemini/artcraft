import React  from 'react';

interface Props {
  size: number,
  email_hash?: string,
  username?: string,
}

function GravatarFc(props: Props) {
    const gravatarUrl = `https://www.gravatar.com/avatar/${props.email_hash}?s=${props.size}`

    let altText = "gravatar";
    if (props.username !== undefined) {
      altText = `${props.username}'s gravatar`;
    }

    return (
      <img alt={altText} src={gravatarUrl} />
    )
}

export { GravatarFc };
