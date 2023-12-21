import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import FavoriteButton from "components/common/FavoriteButton";
import CreatorName from "../CreatorName";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import Button from "components/common/Button";

interface AudioCardProps {
  data: any;
  type: "media" | "weights";
  showCreator?: boolean;
  showCover?: boolean;
}

export default function AudioCard({
  data,
  type,
  showCreator,
  showCover,
}: AudioCardProps) {
  const history = useHistory();

  // console.log("🐙",data, data.public_bucket_path);

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

  // const handleUseModel = () => {
  //   if (type === "weights") {
  //     history.push(`/weights/${data.token}`);
  //   }
  // };

  const timeAgo = useTimeAgo(data.created_at);

  const handleLike = async (data: any) => {
    console.log(`The item is now ${data.isLiked ? "liked" : "not liked"}.`);
  };

  return (
    <Card padding={true} onClick={handleCardClick}>
      {type === "media" && (
        <>
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <div className="d-flex flex-grow-1 align-items-center gap-2">
                <Badge label="Audio" color="teal" />
              </div>
            </div>

            <h6 className="fw-semibold text-white mb-1 mt-3">
              {data.weight_name}
            </h6>
            <p className="fs-7 opacity-75">{timeAgo}</p>
          </div>

          <div onClick={handleInnerClick}>
            <AudioPlayer src={data.public_bucket_path} id={data.token} />
          </div>

          <hr className="my-3" />

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
              <LikeButton onToggle={handleLike} likeCount={data.like || 0} />
            </div>
          </div>
        </>
      )}

      {type === "weights" && (
        <>
          <div className="d-flex">
            {showCover && (
              <div className="cover-img">
                {/* replace source image with api data */}
                <img src="/images/dummy-image-2.jpg" alt="Cover" width={100} />
              </div>
            )}

            <div className="flex-grow-1">
              <div className="d-flex align-items-center">
                <div className="d-flex flex-grow-1">
                  <Badge label="RVC" color="orange" />
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

              <div className="d-flex align-items-center mt-3">
                <div className="flex-grow-1">
                  <h6 className="fw-semibold text-white mb-1">
                    {data.weight_name}
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
            <FavoriteButton onToggle={handleLike} favoriteCount={data.likes} />
          </div>
        </>
      )}
    </Card>
  );
}
