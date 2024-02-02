import React from "react";
import useTimeAgo from "hooks/useTimeAgo";
// import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { MakeRatingsProps } from "hooks/useRatings";
import { faPersonWalking } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import LikeButton from "components/common/LikeButton";
import CreatorName from "components/common/Card/CreatorName";
import Badge from "components/common/Badge";

interface Props {
  data: any,
  makeRatingsProps?: MakeRatingsProps,
  showCreator?: boolean
}


export default function BvhCard({ data, makeRatingsProps, showCreator }: Props) {
  const timeAgo = useTimeAgo(data.created_at);
  const handleInnerClick = (event: any) => event.stopPropagation();
  return <>
    <Icon {...{ className: "card-img", icon: faPersonWalking }}/>
    <div className="card-img-overlay">
      <div className="card-img-gradient" />

      <div className="d-flex align-items-center">
        <div className="d-flex flex-grow-1">
          <Badge label="BVH" color="pink" overlay={true} />
        </div>
      </div>

      <div className="card-img-overlay-text">
        <div>
          <p className="fs-7 opacity-75 mb-0">{timeAgo}</p>
        </div>

        <hr className="my-2" />

        <div
          className="d-flex align-items-center gap-2"
          onClick={handleInnerClick}
        >
          {showCreator && (
            <div className="flex-grow-1">
              <CreatorName
                displayName={
                  data.maybe_creator?.display_name || "Anonymous"
                }
                gravatarHash={data.maybe_creator?.gravatar_hash || null}
                avatarIndex={
                  data.maybe_creator?.default_avatar.image_index || 0
                }
                backgroundIndex={
                  data.maybe_creator?.default_avatar.color_index || 0
                }
                username={data.maybe_creator?.username || "anonymous"}
              />
            </div>
          )}
          {
            makeRatingsProps ? <div>
              <LikeButton
                {...{
                  ...makeRatingsProps({
                    entityToken: data.token,
                    entityType: "media_file",
                  }),
                }}
              />
            </div> : null
          }
        </div>
      </div>
    </div>
  </>;
};