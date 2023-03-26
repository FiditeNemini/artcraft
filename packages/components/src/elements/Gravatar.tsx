import React from "react";

interface Props {
  size: number;
  email_hash?: string;
  username?: string;
  avatarIndex?: number;
}

function Gravatar(props: Props) {
  // TODO: staging domain + local dev support
  let defaultImageUrl = props.avatarIndex === undefined ? 
    "https://fakeyou.com/images/avatars/default-pfp.png" : 
    `https://fakeyou.com/images/avatars/2000x2000/${props.avatarIndex}.png`

  // NB: Gravatar suggests URI encoding these:
  // https://en.gravatar.com/site/implement/images/
  defaultImageUrl = encodeURIComponent(defaultImageUrl);

  const gravatarUrl = `https://www.gravatar.com/avatar/${props.email_hash}?s=${props.size}&d=${defaultImageUrl}`;

  let altText = "gravatar";
  if (props.username !== undefined) {
    altText = `${props.username}'s gravatar`;
  }

  return (
    <img
      className="rounded-circle border border-2 h-100 gravatar-img"
      alt={altText}
      src={gravatarUrl}
      height={props.size}
      width={props.size}
    />
  );
}

export { Gravatar };
