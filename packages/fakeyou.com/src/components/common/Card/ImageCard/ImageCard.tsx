import React from "react";
import { Link, useHistory } from "react-router-dom";
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
import useToken from "hooks/useToken";

interface ImageCardProps {
  bookmarks?: any;
  data: any;
  origin?: string;
  ratings?: any;
  showCreator?: boolean;
  type: "media" | "weights";
  inSelectModal?: boolean;
  onResultSelect?: () => void;
}

export default function ImageCard({
  bookmarks,
  data,
  origin = "",
  showCreator,
  ratings,
  type,
  inSelectModal = false,
  onResultSelect,
}: ImageCardProps) {
  const history = useHistory();
  const { setToken, setWeightTitle } = useToken();
  const linkUrl =
    type === "media"
      ? `/media/${data.token}`
      : `/weight/${data.weight_token || data.details.entity_token}${
          origin ? "?origin=" + origin : ""
        }`;

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const handleSelectModalResultSelect = () => {
    if (inSelectModal) {
      setToken(data.weight_token);
      setWeightTitle && setWeightTitle(data.title);
      onResultSelect && onResultSelect();
    }
  };

  const timeAgo = useTimeAgo(data.created_at);

  const { label: weightBadgeLabel, color: weightBadgeColor } =
    useWeightTypeInfo(
      data.weight_type || data.details?.maybe_weight_data?.weight_type
    );

  const bucketConfig = new BucketConfig();
  let coverImage = undefined;

  if (type === "media") {
    coverImage = bucketConfig.getCdnUrl(data.public_bucket_path, 600, 100);
  } else if (type === "weights") {
    coverImage = `/images/default-covers/${
      data?.cover_image?.default_cover.image_index || 0
    }.webp`;
    if (data?.cover_image?.maybe_cover_image_public_bucket_path) {
      coverImage = bucketConfig.getCdnUrl(
        data.cover_image.maybe_cover_image_public_bucket_path,
        600,
        100
      );
    }
    if (data.details?.maybe_weight_data?.maybe_cover_image_public_bucket_path) {
      coverImage = bucketConfig.getCdnUrl(
        data.details?.maybe_weight_data?.maybe_cover_image_public_bucket_path,
        600,
        100
      );
    }
  }

  const card = (
    <Card
      padding={false}
      canHover={true}
      onClick={handleSelectModalResultSelect}
    >
      {type === "media" && (
        <>
          <img src={coverImage} alt={data.weight_name} className="card-img" />
          <div className="card-img-overlay">
            <div className="card-img-gradient" />

            <div className="d-flex align-items-center">
              <div className="d-flex flex-grow-1">
                <Badge label="Image" color="ultramarine" overlay={true} />
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
              {inSelectModal ? (
                <Button
                  icon={faArrowRight}
                  iconFlip={true}
                  variant="link"
                  label="Select"
                  className="fs-7"
                  onClick={handleSelectModalResultSelect}
                />
              ) : (
                <Button
                  icon={faArrowRight}
                  iconFlip={true}
                  variant="link"
                  label="Use"
                  className="fs-7"
                  onClick={() => {
                    history.push(linkUrl);
                  }}
                />
              )}
            </div>

            <div className="card-img-overlay-text">
              <div className="d-flex align-items-center mt-3">
                <div className="flex-grow-1">
                  <h6 className="fw-semibold text-white mb-1">
                    {data.title || data.details?.maybe_weight_data?.title}
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

                {ratings && (
                  <div>
                    <LikeButton
                      {...{
                        ...ratings.makeProps({
                          entityToken: data.weight_token,
                          entityType: "model_weight",
                        }),
                      }}
                    />
                  </div>
                )}

                {bookmarks && (
                  <BookmarkButton
                    {...{
                      ...bookmarks.makeProps({
                        entityToken: data.weight_token,
                        entityType: "model_weight",
                      }),
                    }}
                  />
                )}
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
            state: { origin },
          }}
        >
          {card}
        </Link>
      )}
    </>
  );
}
