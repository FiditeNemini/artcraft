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

interface VideoCardProps {
  data: any;
  origin?: string;
  ratings: any;
  showCreator?: boolean;
  type: "media" | "weights";
}

export default function VideoCard({ data, origin = "", ratings, showCreator, type }: VideoCardProps) {
  const linkUrl =
    type === "media" ? `/media/${data.token}` : `/weight/${data.weight_token}`;

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const timeAgo = useTimeAgo(data.created_at);

  const videoLink = new BucketConfig().getGcsUrl(data.public_bucket_path);

  return (
    <Link {...{ to: linkUrl, state: { origin }, onClick: () => console.log("🌠 VIDEO CARD") }}>
      <Card padding={false} canHover={true}>
        {type === "media" && (
          <>
            <img
              src={videoLink}
              alt={data.weight_name}
              className="card-video"
            />
            <div className="card-img-overlay">
              <div className="card-img-gradient" />

              <div className="d-flex align-items-center">
                <div className="d-flex flex-grow-1">
                  <Badge label="Video" color="purple" overlay={true} />
                </div>
              </div>
              <FontAwesomeIcon
                icon={faPlayCircle}
                className="card-video-play"
              />
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

                    <div>
                      <LikeButton {...{
                        entityToken: data.token,
                        entityType: "media_file",
                        likeCount: data.likes,
                        onToggle: ratings.toggle
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {type === "weights" && (
          <>
            <img
              src={data.public_bucket_path}
              alt={data.weight_name}
              className="card-video"
            />
            <div className="card-img-overlay">
              <div className="card-img-gradient" />

              <div className="d-flex align-items-center">
                <div className="d-flex flex-grow-1">
                  <Badge label="Video" color="purple" overlay={true} />
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
              <FontAwesomeIcon
                icon={faPlayCircle}
                className="card-video-play"
              />
              <div className="card-img-overlay-text">
                <div>
                  <h6 className="fw-semibold text-white mb-1">
                    {data.weight_name}
                  </h6>
                  <p className="fs-7 opacity-75">{timeAgo}</p>
                  <div className="mt-2" onClick={handleInnerClick}>
                    <LikeButton {...{
                      entityToken: data.weight_token,
                      entityType: "model_weight",
                      likeCount: data.likes,
                      onToggle: ratings.toggle,
                      overlay: true
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}
