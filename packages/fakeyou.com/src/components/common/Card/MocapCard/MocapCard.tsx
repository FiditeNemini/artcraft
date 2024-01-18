import React from "react";
import { Link } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import CreatorName from "../CreatorName";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonWalking } from "@fortawesome/pro-solid-svg-icons";
// import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";

interface ImageCardProps {
  bookmarks: any;
  data: any;
  origin?: string;
  ratings: any;
  showCreator?: boolean;
  type: "media" | "weights";
}

export default function ImageCard({
  bookmarks,
  data,
  origin = "",
  showCreator,
  ratings,
  type,
}: ImageCardProps) {
  const linkUrl =
    type === "media"
      ? `/media/${data.token}`
      : `/weight/${data.weight_token || data.details.entity_token}${
          origin ? "?origin=" + origin : ""
        }`;

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const timeAgo = useTimeAgo(data.created_at);

  // const bucketConfig = new BucketConfig();

  return (
    <Link
      {...{
        to: linkUrl,
        state: { origin },
      }}
    >
      <Card padding={false} canHover={true}>
        <FontAwesomeIcon {...{ className: "card-mocap", icon: faPersonWalking }}/>
        <div className="card-img-overlay">
          <div className="card-img-gradient" />

          <div className="d-flex align-items-center">
            <div className="d-flex flex-grow-1">
              <Badge label="Mocap" color="pink" overlay={true} />
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

              <div>
                <LikeButton
                  {...{
                    ...ratings.makeProps({
                      entityToken: data.token,
                      entityType: "media_file",
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
