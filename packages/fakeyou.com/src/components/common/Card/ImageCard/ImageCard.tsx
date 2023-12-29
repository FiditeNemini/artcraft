import React from "react";
import { Link } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import BookmarkButton from "components/common/BookmarkButton";
import CreatorName from "../CreatorName";
import Button from "components/common/Button";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import useWeightTypeInfo from "hooks/useWeightTypeInfo/useWeightTypeInfo";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";

interface ImageCardProps {
  bookmarks: any;
  data: any;
  origin?: string;
  type: "media" | "weights";
  showCreator?: boolean;
}

export default function ImageCard({
  bookmarks,
  data,
  origin = "",
  type,
  showCreator,
}: ImageCardProps) {
  const linkUrl =
    type === "media"
      ? `/media/${data.token}`
      : `/weight/${data.weight_token || data.details.entity_token}`;

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const timeAgo = useTimeAgo(data.created_at);

  const handleLike = async () => {
    console.log(`The item is now ${data.isLiked ? "liked" : "not liked"}.`);
    return true; // temporary will be replaced with like function
  };

  const { label: weightBadgeLabel, color: weightBadgeColor } =
    useWeightTypeInfo(
      data.weights_type || data.details?.maybe_weights_data?.weights_type
    );

  const imageLink = new BucketConfig().getGcsUrl(data.public_bucket_path);

  console.log("🌇", origin);
  const bucketConfig = new BucketConfig();
  let coverImage = "/images/avatars/default-pfp.png";

  if (type === "media") {
    coverImage = bucketConfig.getCdnUrl(data.public_bucket_path, 400, 100);
  } else if (type === "weights") {
    if (data.maybe_cover_image_public_bucket_path) {
      coverImage = bucketConfig.getCdnUrl(
        data.maybe_cover_image_public_bucket_path,
        400,
        100
      );
    }
    if (
      data.details?.maybe_weights_data?.maybe_cover_image_public_bucket_path
    ) {
      coverImage = bucketConfig.getCdnUrl(
        data.details?.maybe_weights_data?.maybe_cover_image_public_bucket_path,
        400,
        100
      );
    }
  }

  return (
    <Link
      {...{
        to: linkUrl,
        state: { origin },
        onClick: () => console.log("🌠 IMG CARD"),
      }}
    >
      <Card padding={false} canHover={true}>
        {type === "media" && (
          <>
            <img src={coverImage} alt={data.weight_name} className="card-img" />
            <div className="card-img-overlay">
              <div className="card-img-gradient" />

              <div className="d-flex align-items-center">
                <div className="d-flex flex-grow-1">
                  <Badge label="Image" color="ultramarine" overlay={true} />
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
                    <LikeButton onToggle={handleLike} likeCount={data.likes} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {type === "weights" && (
          <>
            <img src={coverImage} alt={data.title} className="card-img" />
            <div className="card-img-overlay">
              <div className="card-img-gradient" />
              <div className="d-flex align-items-center">
                <div className="d-flex flex-grow-1">
                  <Badge
                    label={weightBadgeLabel}
                    color={weightBadgeColor}
                    overlay={true}
                  />
                </div>
                <Button
                  icon={faArrowRight}
                  iconFlip={true}
                  variant="link"
                  label="Use"
                  to={linkUrl}
                  className="fs-7"
                />
              </div>

              <div className="card-img-overlay-text">
                <div className="d-flex align-items-center mt-3">
                  <div className="flex-grow-1">
                    <h6 className="fw-semibold text-white mb-1">
                      {data.title || data.details?.maybe_weights_data?.title}
                    </h6>
                    <p className="fs-7 opacity-75 mb-0">{timeAgo}</p>
                  </div>
                </div>

                <hr className="my-2" />

                <div
                  className="d-flex align-items-center gap-2"
                  onClick={handleInnerClick}
                >
                  {showCreator && (
                    <div className="flex-grow-1">
                      <CreatorName
                        displayName={data.creator?.display_name || "Anonymous"}
                        gravatarHash={data.creator?.gravatar_hash || null}
                        avatarIndex={
                          data.creator?.default_avatar.image_index || 0
                        }
                        backgroundIndex={
                          data.creator?.default_avatar.color_index || 0
                        }
                        username={data.creator?.username || "anonymous"}
                      />
                    </div>
                  )}

                  <div>
                    <LikeButton onToggle={handleLike} likeCount={data.likes} />
                  </div>
                  <BookmarkButton
                    {...{
                      entityToken: data.weight_token,
                      entityType: "model_weight",
                      onToggle: bookmarks.toggle,
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}
