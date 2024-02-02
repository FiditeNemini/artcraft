import React from "react";
import { Link } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import CreatorName from "../CreatorName";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/pro-solid-svg-icons";
import getCardUrl from "../getCardUrl";

interface GLTFCardProps {
  bookmarks: any;
  data: any;
  ratings: any;
  showCreator?: boolean;
  source?: string;
  type: "media" | "weights";
}

export default function GLTFCard({
  bookmarks,
  data,
  showCreator,
  source = "",
  ratings,
  type,
}: GLTFCardProps) {
  const linkUrl = getCardUrl(data, source, type);

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const timeAgo = useTimeAgo(data.created_at);

  return (
    <Link
      {...{
        to: linkUrl,
      }}
    >
      <Card padding={false} canHover={true}>
        <div className="card-img d-flex align-items-center justify-content-center">
          <FontAwesomeIcon icon={faCube} className="card-img-icon" />
        </div>

        <div className="card-img-overlay">
          <div className="card-img-gradient" />

          <div className="d-flex align-items-center">
            <div className="d-flex flex-grow-1">
              <Badge {...{ className: "fy-entity-type-gltf", label: "GLTF", overlay: true }}/>
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
