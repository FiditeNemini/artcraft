import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";
import Button from "components/common/Button";
import FavoriteButton from "components/common/FavoriteButton";

interface ImageCardProps {
  data: any;
  type: "media" | "weights";
}

export default function ImageCard({ data, type }: ImageCardProps) {
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
              <div onClick={handleInnerClick} className="mt-2">
                <LikeButton
                  onToggle={handleLike}
                  likeCount={data.likes}
                  overlay={true}
                />
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
              <div onClick={handleInnerClick}>
                <FavoriteButton
                  onToggle={handleLike}
                  favoriteCount={data.likes}
                  overlay={true}
                />
              </div>
            </div>

            <div className="card-img-overlay-text">
              <div className="d-flex align-items-center mt-3">
                <div className="flex-grow-1">
                  <h6 className="fw-semibold text-white mb-1">
                    {data.weight_name}
                  </h6>
                  <p className="fs-7 opacity-75">{timeAgo}</p>
                </div>
                <div onClick={handleInnerClick}>
                  <Button label="Use" small={true} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
