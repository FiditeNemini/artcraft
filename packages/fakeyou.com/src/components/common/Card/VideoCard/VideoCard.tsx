import React from "react";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlayCircle } from "@fortawesome/pro-solid-svg-icons";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import Button from "components/common/Button";
import CreatorName from "../CreatorName";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Link } from "react-router-dom";
import getCardUrl from "../getCardUrl";

interface VideoCardProps {
  data: any;
  ratings?: any;
  showCreator?: boolean;
  source?: string;
  type: "media" | "weights";
  inSelectModal?: boolean;
  onResultSelect?: (data:{token: string, title:string}) => void;
}

export default function VideoCard({
  data,
  ratings,
  showCreator,
  source = "",
  type,
  inSelectModal = false,
  onResultSelect,
}: VideoCardProps) {
  const linkUrl = getCardUrl(data,source,type);

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const handleSelectModalResultSelect = () => {
    if (inSelectModal && onResultSelect) {
      onResultSelect(data);
    }
  };

  const timeAgo = useTimeAgo(data.created_at);

  const bucketConfig = new BucketConfig();
  //video doesnt have random cover image endpoint or thumbnails yet
  let coverImage = `/images/default-covers/${
    data?.cover_image?.default_cover.image_index || 0
  }.webp`;

  if (data?.cover_image?.maybe_cover_image_public_bucket_path) {
    coverImage = bucketConfig.getCdnUrl(
      data.cover_image.maybe_cover_image_public_bucket_path,
      600,
      100
    );
  }

  const card = (
    <Card
      padding={false}
      canHover={true}
      onClick={handleSelectModalResultSelect}
    >
      {type === "media" && (
        <>
          <img src={coverImage} alt={data.weight_name} className="card-video" />
          <div className="card-img-overlay">
            <div className="card-img-gradient" />

            <div className="d-flex align-items-center">
              <div className="d-flex flex-grow-1">
                <Badge label="Video" color="purple" overlay={true} />
              </div>
              {inSelectModal && (
                <Button
                  icon={faArrowRight}
                  iconFlip={true}
                  variant="link"
                  label="Select"
                  className="fs-7"
                  onClick={handleSelectModalResultSelect}
                />
              )}
            </div>
            <FontAwesomeIcon icon={faPlayCircle} className="card-video-play" />
            <div className="card-img-overlay-text">
              <div>
                <h6 className="fw-semibold text-white mb-1">
                  {data.weight_name}
                </h6>
                <p className="fs-7 opacity-75">{timeAgo}</p>
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
                        gravatarHash={data.maybe_creator?.gravatar_hash || ""}
                        avatarIndex={
                          data.maybe_creator?.default_avatar.image_index || ""
                        }
                        backgroundIndex={
                          data.maybe_creator?.default_avatar.color_index || ""
                        }
                        username={data.maybe_creator?.username || "anonymous"}
                      />
                    </div>
                  )}

                  {ratings && (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );

  return (
    <>
      {inSelectModal ? (
        <>{card}</>
      ) : (
        <Link
          {...{
            to: linkUrl,
          }}
        >
          {card}
        </Link>
      )}
    </>
  );
}
