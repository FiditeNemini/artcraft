import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import FavoriteButton from "components/common/FavoriteButton";
import CreatorName from "../CreatorName";
import Button from "components/common/Button";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";

interface ImageCardProps {
  data: any;
  type: "media" | "weights";
  showCreator?: boolean;
}

export default function ImageCard({ data, type, showCreator }: ImageCardProps) {
  const history = useHistory();

  const handleCardClick = () => {
    if (type === "media") {
      history.push(`/media/${data.token}`);
    } else if (type === "weights") {
      history.push(`/weight/${data.token}`);
    }
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
            className="card-img"
          />
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
                      displayName={data.maybe_creator_user.display_name}
                      gravatarHash={data.maybe_creator_user.gravatar_hash}
                      avatarIndex={
                        data.maybe_creator_user.default_avatar.image_index
                      }
                      backgroundIndex={
                        data.maybe_creator_user.default_avatar.color_index
                      }
                      username={data.maybe_creator_user.username}
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
          <img
            src={data.public_bucket_path}
            alt={data.weight_name}
            className="card-img"
          />
          <div className="card-img-overlay">
            <div className="card-img-gradient" />
            <div className="d-flex align-items-center">
              <div className="d-flex flex-grow-1">
                <Badge label="LORA" color="pink" overlay={true} />
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

            <div className="card-img-overlay-text">
              <div className="d-flex align-items-center mt-3">
                <div className="flex-grow-1">
                  <h6 className="fw-semibold text-white mb-1">
                    {data.weight_name}
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
                      displayName={data.maybe_creator_user.display_name}
                      gravatarHash={data.maybe_creator_user.gravatar_hash}
                      avatarIndex={
                        data.maybe_creator_user.default_avatar.image_index
                      }
                      backgroundIndex={
                        data.maybe_creator_user.default_avatar.color_index
                      }
                      username={data.maybe_creator_user.username}
                    />
                  </div>
                )}

                <div>
                  <LikeButton onToggle={handleLike} likeCount={data.likes} />
                </div>
                <FavoriteButton
                  onToggle={handleLike}
                  favoriteCount={data.likes}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
