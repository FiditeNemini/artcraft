import React from "react";
import { Link, useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import BookmarkButton from "components/common/BookmarkButton";
import CreatorName from "../CreatorName";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import Button from "components/common/Button";
import useWeightTypeInfo from "hooks/useWeightTypeInfo/useWeightTypeInfo";
import WeightCoverImage from "components/common/WeightCoverImage";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
// import useToken from "hooks/useToken";
import getCardUrl from "../getCardUrl";

interface AudioCardProps {
  bookmarks?: any;
  data: any;
  ratings?: any;
  showCreator?: boolean;
  showCover?: boolean;
  source?: string;
  type: "media" | "weights";
  inSelectModal?: boolean;
  onResultSelect?: (data:{token: string, title:string}) => void;
}

export default function AudioCard({
  bookmarks,
  data,
  ratings,
  showCreator,
  showCover,
  source = "",
  type,
  inSelectModal = false,
  onResultSelect,
}: AudioCardProps) {
  // const { setToken, setWeightTitle } = useToken();
  const linkUrl = getCardUrl(data,source,type);
  const history = useHistory();

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const handleSelectModalResultSelect = () => {
    console.log(`inSelectModal : ${inSelectModal}`);
    console.log(`onResultSelect : ${onResultSelect}`);
    if (inSelectModal && onResultSelect) {
      onResultSelect({
        token: data.weight_token,
        title: data.title
      });
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
    coverImage = bucketConfig.getCdnUrl(data.public_bucket_path, 400, 100);
  } else if (type === "weights") {
    if (data?.cover_image?.maybe_cover_image_public_bucket_path) {
      coverImage = bucketConfig.getCdnUrl(
        data.cover_image.maybe_cover_image_public_bucket_path,
        110,
        100
      );
    }
    if (data.details?.maybe_weight_data?.maybe_cover_image_public_bucket_path) {
      coverImage = bucketConfig.getCdnUrl(
        data.details?.maybe_weight_data?.maybe_cover_image_public_bucket_path,
        110,
        100
      );
    }
  }

  const card = (
    <Card
      padding={true}
      canHover={true}
      onClick={handleSelectModalResultSelect}
    >
      {type === "media" && (
        <>
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <div className="d-flex flex-grow-1 align-items-center gap-2">
                <Badge label="Audio" color="teal" />
              </div>
            </div>

            <h6 className="fw-semibold text-white mb-1 mt-3">
              {data.origin.maybe_model
                ? data.origin.maybe_model.title
                : "Media Audio"}
            </h6>
            <p className="fs-7 opacity-75">{timeAgo}</p>
          </div>

          <AudioPlayer src={data.public_bucket_path} id={data.token} />

          <hr className="my-3" />

          <div
            className="d-flex align-items-center gap-2"
            onClick={handleInnerClick}
          >
            {showCreator && (
              <div className="flex-grow-1">
                <CreatorName
                  displayName={data.maybe_creator?.display_name || "Anonymous"}
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
        </>
      )}

      {type === "weights" && (
        <>
          <div className="d-flex">
            {showCover && (
              <WeightCoverImage
                src={coverImage}
                height={110}
                width={110}
                coverIndex={data?.cover_image?.default_cover?.image_index}
              />
            )}

            <div className="flex-grow-1">
              <div className="d-flex align-items-center">
                <div className="d-flex flex-grow-1">
                  <Badge label={weightBadgeLabel} color={weightBadgeColor} />
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

              <div className="d-flex align-items-center mt-3">
                <div className="flex-grow-1">
                  <h6 className="fw-semibold text-white mb-1">
                    {data.title || data.details.maybe_weight_data.title}
                  </h6>
                  <p className="fs-7 opacity-75">{timeAgo}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-3" />

          <div
            className="d-flex align-items-center gap-2"
            onClick={handleInnerClick}
          >
            {showCreator && (
              <div className="flex-grow-1">
                <CreatorName
                  displayName={
                    data.creator?.display_name ||
                    data.details?.maybe_weight_data.maybe_creator
                      .display_name ||
                    "Anonymous"
                  }
                  gravatarHash={data.creator?.gravatar_hash || null}
                  avatarIndex={data.creator?.default_avatar.image_index || 0}
                  backgroundIndex={
                    data.creator?.default_avatar.color_index || 0
                  }
                  username={
                    data.creator?.username ||
                    data.details?.maybe_weight_data.maybe_creator.username ||
                    "anonymous"
                  }
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
            to: linkUrl
          }}
        >
          {card}
        </Link>
      )}
    </>
  );
}
