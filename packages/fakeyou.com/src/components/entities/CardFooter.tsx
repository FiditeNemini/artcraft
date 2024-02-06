import React from "react";
import { MakeRatingsProps } from "hooks/useRatings";
import LikeButton from "components/common/LikeButton";
import CreatorName from "components/common/Card/CreatorName";

interface CardFooterProps {
  creator?: any,
  entityToken: string,
  entityType: string,
  makeRatingsProps?: MakeRatingsProps,
  showCreator?: boolean
}

export default function CardFooter({ creator, entityToken, entityType, makeRatingsProps, showCreator }: CardFooterProps) {
  const { default_avatar, display_name, gravatar_hash, username } = creator || {};
  return <>
    { (showCreator || makeRatingsProps) && <hr className="my-2" /> }
    <div {...{ className: "fy-card-footer" }}>
      { showCreator && (
        <div className="flex-grow-1">
          <CreatorName {...{
            avatarIndex: default_avatar?.image_index || 0,
            backgroundIndex: default_avatar?.color_index || 0,
            displayName: display_name || "Anonymous",
            gravatarHash: gravatar_hash || null,
            username
          }} />
        </div>
      )}
      {
        makeRatingsProps ? <div>
          <LikeButton {...makeRatingsProps({ entityToken, entityType })} />
        </div> : null
      }
    </div>
  </>;
};