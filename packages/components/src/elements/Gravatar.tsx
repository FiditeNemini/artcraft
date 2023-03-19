import React from "react";

interface Props {
  size: number;
  email_hash?: string;
  username?: string;
}

function Gravatar(props: Props) {
  const gravatarUrl = `https://www.gravatar.com/avatar/${props.email_hash}?s=${props.size}&d=https://fakeyou.com/images/avatars/default-pfp.png`;

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
