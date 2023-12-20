import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import FavoriteButton from "components/common/FavoriteButton";
import Button from "components/common/Button";

interface AudioCardProps {
  data: any;
  type: "media" | "weights";
}

export default function AudioCard({ data, type }: AudioCardProps) {
  const history = useHistory();

  // console.log("🐙",data);

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

  const handleUseModel = () => {
    if (type === "weights") {
      history.push(`/weight/${data.token}`);
    }
  };

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
              <div className="d-flex flex-grow-1">
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

          <div className="mt-3" onClick={handleInnerClick}>
            <LikeButton onToggle={handleLike} likeCount={data.like || 0 } />
          </div>
        </>
      )}

      {type === "weights" && (
        <>
          <div>
            <div className="d-flex align-items-center">
              <div className="d-flex flex-grow-1">
                <Badge label="RVC" color="orange" />
              </div>
              <div onClick={handleInnerClick}>
                <FavoriteButton
                  onToggle={handleLike}
                  favoriteCount={data.likes}
                />
              </div>
            </div>

            <div className="d-flex align-items-center mt-3">
              <div className="flex-grow-1">
                <h6 className="fw-semibold text-white mb-1">
                  {data.weight_name}
                </h6>
                <p className="fs-7 opacity-75">{timeAgo}</p>
              </div>
              <div onClick={handleInnerClick}>
                <Button label="Use" small={true} onClick={handleUseModel} />
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
