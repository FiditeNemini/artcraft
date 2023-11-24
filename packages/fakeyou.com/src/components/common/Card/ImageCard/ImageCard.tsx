import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";

interface ImageCardProps {
  data: any;
  to: string;
}

export default function ImageCard({ data, to }: ImageCardProps) {
  const history = useHistory();

  const handleCardClick = () => {
    history.push(to);
  };

  const timeAgo = useTimeAgo(data.created_at);

  return (
    <Card padding={false} onClick={handleCardClick}>
      <img
        src={data.public_bucket_path}
        alt={data.weight_name}
        className="card-img"
      />
      <div className="card-image-overlay">
        <div className="card-image-gradient" />
        <div className="card-image-overlay-text">
          <div>
            <h6 className="fw-semibold text-white mb-1">{data.weight_name}</h6>
            <p className="fs-7 opacity-75">{timeAgo}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
