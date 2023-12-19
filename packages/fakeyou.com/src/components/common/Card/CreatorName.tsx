import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import React from "react";
import { Link } from "react-router-dom";

interface CreatorNameProps {
  displayName: string;
  username: string;
  gravatarHash: string;
  avatarIndex: number;
  backgroundIndex: number;
  className?: string;
}

const handleInnerClick = (event: any) => {
  event.stopPropagation();
};

export default function CreatorName({
  displayName,
  gravatarHash,
  avatarIndex,
  backgroundIndex,
  username,
  className,
}: CreatorNameProps) {
  return (
    <div
      className={`d-flex gap-2 align-items-center ${className}`}
      onClick={handleInnerClick}
    >
      <Gravatar
        size={22}
        email_hash={gravatarHash}
        avatarIndex={avatarIndex}
        backgroundIndex={backgroundIndex}
      />
      <Link
        to={`/profile/${username}`}
        className="fw-medium fs-7 text-white opacity-75 text-truncate"
      >
        {displayName}
      </Link>
    </div>
  );
}
