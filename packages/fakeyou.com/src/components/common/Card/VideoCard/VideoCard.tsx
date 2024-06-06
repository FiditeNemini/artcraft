import React, { useEffect, useState } from "react";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import Badge from "components/common/Badge";
import Button from "components/common/Button";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Link } from "react-router-dom";
import getCardUrl from "../getCardUrl";
import { STYLES_BY_KEY } from "common/StyleOptions";

interface VideoCardProps {
  bookmarks?: any;
  data: any;
  ratings?: any;
  showCreator?: boolean;
  source?: string;
  type: "media" | "weights";
  inSelectModal?: boolean;
  onResultSelect?: (data: { token: string; title: string }) => void;
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
  const linkUrl = getCardUrl(data, source, type);

  const handleSelectModalResultSelect = () => {
    if (inSelectModal && onResultSelect) {
      onResultSelect(data);
    }
  };

  const timeAgo = useTimeAgo(data.created_at);
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [gifExists, setGifExists] = useState(false);
  const [staticImageExists, setStaticImageExists] = useState(false);

  const bucketConfig = new BucketConfig();
  //video doesnt have random cover image endpoint or thumbnails yet
  const defaultImageUrl = `/images/default-covers/${
    data?.cover_image?.default_cover.image_index || 0
  }.webp`;

  // We are checking the existence of the bucket gif files because it seems as though we can't check the cdn file's existence without running into cors issues
  // CDN URLS
  const staticImageUrl = data?.public_bucket_path
    ? bucketConfig.getCdnUrl(data.public_bucket_path + "-thumb.jpg", 600, 100)
    : defaultImageUrl;
  const gifUrl = data?.public_bucket_path
    ? bucketConfig.getCdnUrl(data.public_bucket_path + "-thumb.gif", 360, 20)
    : null;

  // BUCKET URLS
  const bucketGifUrl = data?.public_bucket_path
    ? bucketConfig.getGcsUrl(data.public_bucket_path + "-thumb.gif")
    : null;
  const bucketImageUrl = data?.public_bucket_path
    ? bucketConfig.getGcsUrl(data.public_bucket_path + "-thumb.jpg")
    : null;

  const checkGifExists = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Preload images and check if the GIF exists when the component mounts
  useEffect(() => {
    // Check if the static image exists

    if (bucketImageUrl === null) return;
    checkImageExists(bucketImageUrl).then(staticExists => {
      setStaticImageExists(staticExists);
      if (staticExists) {
        setImageSrc(bucketImageUrl);
      } else {
        setImageSrc(defaultImageUrl);
      }
    });

    // Check and preload the GIF if it exists
    if (bucketGifUrl === null) return;
    checkGifExists(bucketGifUrl).then(gifExists => {
      setGifExists(gifExists);
      if (gifExists) {
        const imgGif = new Image();
        imgGif.src = bucketGifUrl;
      }
    });
  }, [bucketGifUrl, staticImageUrl, defaultImageUrl, bucketImageUrl]);

  useEffect(() => {
    if (isHovered && gifExists && bucketGifUrl && staticImageExists) {
      setImageSrc(gifUrl!);
    } else if (staticImageExists) {
      setImageSrc(bucketImageUrl!);
    } else {
      setImageSrc(defaultImageUrl);
    }
  }, [
    isHovered,
    gifExists,
    gifUrl,
    bucketGifUrl,
    staticImageUrl,
    staticImageExists,
    defaultImageUrl,
    bucketImageUrl,
  ]);

  const styleLabel = STYLES_BY_KEY.has(data.maybe_style_name)
    ? STYLES_BY_KEY.get(data.maybe_style_name)?.label
    : "Unknown Style";

  const card = (
    <Card
      padding={false}
      canHover={true}
      onClick={handleSelectModalResultSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {type === "media" && (
        <>
          <img
            src={imageSrc}
            alt={data.weight_name}
            className="card-video"
            loading="lazy"
          />
          <div className="card-video-overlay">
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
            <div className="card-img-overlay-text">
              <div>
                <h6 className="fw-semibold text-white mb-1">
                  {data.maybe_title}
                </h6>
                <p className="fs-7 opacity-75">
                  {timeAgo}
                  <span className="px-2">•</span>
                  {styleLabel}
                </p>
                {/* <CardFooter
                  {...{
                    creator: data?.maybe_creator,
                    entityToken: data.token,
                    entityType: "media_file",
                    makeBookmarksProps: bookmarks?.makeProps,
                    makeRatingsProps: ratings?.makeProps,
                    showCreator,
                  }}
                /> */}
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
