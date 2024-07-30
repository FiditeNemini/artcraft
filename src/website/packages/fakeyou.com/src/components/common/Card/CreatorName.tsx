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
  noHeight?: boolean;
}

export default function CreatorName({
  displayName,
  gravatarHash,
  avatarIndex,
  backgroundIndex,
  username,
  className,
  noHeight,
}: CreatorNameProps) {
  const handleInnerClick = (event: any) => {
    // event.stopPropagation();
  };

  const gravatar = (
    <Gravatar
      {...{ noHeight }}
      size={22}
      email_hash={gravatarHash}
      avatarIndex={avatarIndex || 0}
      backgroundIndex={backgroundIndex || 0}
    />
  );

  return (
    <>
      {displayName === "Anonymous" ? (
        <div className="d-flex gap-2 align-items-center">
          {gravatar}
          <div
            {...{
              className: "fw-medium fs-7 text-white opacity-75 text-truncate",
            }}
          >
            {displayName}
          </div>
        </div>
      ) : (
        <Link
          className={`d-flex gap-2 align-items-center ${className}`}
          onClick={handleInnerClick}
          to={`/profile/${username}`}
        >
          {gravatar}
          <div
            {...{
              className: "fw-medium fs-7 text-white opacity-75 text-truncate",
            }}
          >
            {displayName}
          </div>
        </Link>
      )}
    </>
  );
}
