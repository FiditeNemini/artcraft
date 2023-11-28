import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/pro-solid-svg-icons";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";

interface VideoCardProps {
  data: any;
  type: "media" | "weights";
}

export default function VideoCard({ data, type }: VideoCardProps) {
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
              <div className="flex-grow-1">
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
              <div className="flex-grow-1">
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
