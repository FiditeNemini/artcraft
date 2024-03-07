import React from "react";
import { Link, useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";
import useTimeAgo from "hooks/useTimeAgo";
import { CardFooter } from "components/entities";
import Badge from "components/common/Badge";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import Button from "components/common/Button";
import useWeightTypeInfo from "hooks/useWeightTypeInfo/useWeightTypeInfo";
import WeightCoverImage from "components/common/WeightCoverImage";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import getCardUrl from "../getCardUrl";
// import getCardUrl from "../getCardUrl";

interface AudioCardProps {
  bookmarks?: any;
  data: any;
  ratings?: any;
  showCreator?: boolean;
  showCover?: boolean;
  source?: string;
  type: "media" | "weights";
  inSelectModal?: boolean;
  onResultSelect?: (data: { token: string; title: string }) => void;
  onResultBookmarkSelect?: (data: { token: string; title: string }) => void;
  // onClick?: (e:any) => any;
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
  // onClick: inClick,
  onResultSelect,
  onResultBookmarkSelect,
}: AudioCardProps) {
  const linkUrl = getCardUrl(data, source, type);
  const history = useHistory();

  const handleSelectModalResultSelect = () => {
    if (inSelectModal) {
      onResultSelect &&
        onResultSelect({
          token: data.weight_token,
          title: data.title,
        });

      onResultBookmarkSelect &&
        onResultBookmarkSelect({
          token: data.details.entity_token,
          title: data.details.maybe_weight_data.title,
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
                <Badge
                  {...{ className: "fy-entity-type-audio", label: "Audio" }}
                />
              </div>
            </div>

            <h6 className="fw-semibold text-white mb-1 mt-3">
              {data.origin?.maybe_model
                ? data.origin.maybe_model.title
                : "Media Audio"}
            </h6>
            <p className="fs-7 opacity-75">{timeAgo}</p>
            {data.maybe_text_transcript && (
              <p className="fs-7 mt-2 two-line-ellipsis">
                {data.maybe_text_transcript}
              </p>
            )}
          </div>
          <AudioPlayer src={data.details?.maybe_media_file_data?.public_bucket_path || data.public_bucket_path} id={data.token} />
          <CardFooter
            {...{
              creator: data?.maybe_creator || data.details?.maybe_media_file_data?.maybe_creator,
              entityToken: data.details?.entity_token || data.token,
              entityType: "media_file",
              makeBookmarksProps: bookmarks?.makeProps,
              makeRatingsProps: ratings?.makeProps,
              showCreator,
            }}
          />
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
                    onClick={() => {
                      history.push(linkUrl);
                    }}
                  />
                ) : (
                  <Button
                    icon={faArrowRight}
                    iconFlip={true}
                    variant="link"
                    label="Use"
                    className="fs-7"
                    onClick={handleSelectModalResultSelect}
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
          <CardFooter
            {...{
              creator: data?.creator || data.details.maybe_weight_data?.maybe_creator,
              entityToken: data.weight_token || data.details?.entity_token,
              entityType: "model_weight",
              makeBookmarksProps: bookmarks?.makeProps,
              makeRatingsProps: ratings?.makeProps,
              showCreator,
            }}
          />
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
