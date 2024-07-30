import React from "react";
import moment from "moment";
import { MakeRatingsProps } from "hooks/useRatings";
import WeightCoverImage from "components/common/WeightCoverImage";
import CardBadge from "../CardBadge";
import CardFooter from "../CardFooter";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import useWeightTypeInfo from "hooks/useWeightTypeInfo";
import { WeightType } from "@storyteller/components/src/api/_common/enums";

interface Props {
  data: any;
  makeRatingsProps?: MakeRatingsProps;
  showCover?: boolean;
  showCreator?: boolean;
}

export default function WeightCard({
  data,
  makeRatingsProps,
  showCover = true,
  showCreator,
}: Props) {
  const {
    cover_image,
    created_at,
    details,
    maybe_creator,
    title,
    token,
    weight_type,
  } = data || {};
  const timeCreated = moment(created_at || "").fromNow();
  const path =
    cover_image.maybe_cover_image_public_bucket_path ||
    details?.cover_image?.maybe_cover_image_public_bucket_path;
  const bucketConfig = new BucketConfig();
  const coverImage = path
    ? bucketConfig.getCdnUrl(path, 110, 100)
    : "/images/avatars/default-pfp.png";

  const weightTypeInfo = useWeightTypeInfo(weight_type || WeightType.NONE);
  const { label: weightType, color: weightTagColor } = weightTypeInfo;

  return (
    <>
      <div className="d-flex">
        {showCover && (
          <WeightCoverImage
            src={coverImage}
            height={96}
            width={96}
            coverIndex={cover_image?.default_cover?.image_index}
          />
        )}

        <div className="flex-grow-1">
          <CardBadge
            className={`fy-entity-type-${weight_type || ""}`}
            label={weightType || ""}
            small={true}
            color={weightTagColor || ""}
          />

          <div className="d-flex align-items-center mt-2">
            <div className="flex-grow-1">
              <h6 className="fw-semibold text-white mb-1">
                {title || details.maybe_weight_data.title}
              </h6>
              <p className="fs-7 opacity-75">{timeCreated}</p>
            </div>
          </div>
        </div>
        <div
          className="position-absolute fs-7 fw-medium fy-select-voice"
          style={{ bottom: "8px", right: "8px" }}
        >
          Use
        </div>
      </div>
      <CardFooter
        {...{
          creator: maybe_creator,
          entityToken: token,
          entityType: "media_file",
          makeRatingsProps,
        }}
      />
    </>
  );
}
