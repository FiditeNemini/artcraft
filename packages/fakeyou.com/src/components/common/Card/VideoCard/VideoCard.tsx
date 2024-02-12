import React from "react";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlayCircle } from "@fortawesome/pro-solid-svg-icons";
import Badge from "components/common/Badge";
import Button from "components/common/Button";
import { CardFooter } from "components/entities";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Link } from "react-router-dom";
import getCardUrl from "../getCardUrl";

interface VideoCardProps {
  bookmarks?: any;
  data: any;
  ratings?: any;
  showCreator?: boolean;
  source?: string;
  type: "media" | "weights";
  inSelectModal?: boolean;
  onResultSelect?: (data:{token: string, title:string}) => void;
}

export default function VideoCard({
  bookmarks,
  data,
  ratings,
  showCreator,
  source = "",
  type,
  inSelectModal = false,
  onResultSelect,
}: VideoCardProps) {
  const linkUrl = getCardUrl(data,source,type);

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
                <CardFooter {...{
                  creator: data?.maybe_creator, 
                  entityToken: data.token,
                  entityType: "media_file",
                  makeBookmarksProps: bookmarks?.makeProps,
                  makeRatingsProps: ratings?.makeProps
                }}/>
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
