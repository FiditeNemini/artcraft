import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlayCircle } from "@fortawesome/pro-solid-svg-icons";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import Button from "components/common/Button";
import CreatorName from "../CreatorName";

interface VideoCardProps {
  data: any;
  type: "media" | "weights";
  showCreator?: boolean;
}

export default function VideoCard({ data, type, showCreator }: VideoCardProps) {
  const history = useHistory();

  const handleCardClick = () => {
    history.push(`/media/${data.token}`);
  };

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const timeAgo = useTimeAgo(data.created_at);

  const handleLike = async (data: any) => {
    console.log(`The item is now ${data.isLiked ? "liked" : "not liked"}.`);
  };

  return (
    <Card padding={false} onClick={handleCardClick}>
      {type === "media" && (
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
                        displayName={data.maybe_creator_user.display_name}
                        gravatarHash={data.maybe_creator_user.gravatar_hash}
                        avatarIndex={
                          data.maybe_creator_user.default_avatar.image_index
                        }
                        backgroundIndex={
                          data.maybe_creator_user.default_avatar.color_index
                        }
                      />
                    </div>
                  )}

                  <div>
                    <LikeButton onToggle={handleLike} likeCount={data.likes} />
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
                onClick={handleCardClick}
                className="fs-7"
              />
            </div>
            <FontAwesomeIcon icon={faPlayCircle} className="card-video-play" />
            <div className="card-img-overlay-text">
              <div>
                <h6 className="fw-semibold text-white mb-1">
                  {data.weight_name}
                </h6>
                <p className="fs-7 opacity-75">{timeAgo}</p>
                <div className="mt-2" onClick={handleInnerClick}>
                  <LikeButton
                    onToggle={handleLike}
                    likeCount={data.likes}
                    overlay={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
