import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";
import LikeButton from "components/common/LikeButton";

interface AudioCardProps {
  data: any;
}

export default function AudioCard({ data }: AudioCardProps) {
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
    <Card padding={true} onClick={handleCardClick}>
      <div className="mb-3">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <Badge label="Audio" color="teal" />
          </div>
          <div onClick={handleInnerClick}>
            <LikeButton onToggle={handleLike} likeCount={data.likes} />
          </div>
        </div>

        <h6 className="fw-semibold text-white mb-1 mt-3">{data.weight_name}</h6>
        <p className="fs-7 opacity-75">{timeAgo}</p>
      </div>

      <div onClick={handleInnerClick}>
        <AudioPlayer src={data.public_bucket_path} id={data.token} />
      </div>
    </Card>
  );
}
