import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import useTimeAgo from "hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/pro-solid-svg-icons";
import Badge from "components/common/Badge";

interface VideoCardProps {
  data: any;
  to: string;
}

export default function VideoCard({ data, to }: VideoCardProps) {
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
      <div className="card-img-overlay">
        <div className="card-img-gradient" />
        <Badge label="Video" color="purple" />
        <FontAwesomeIcon icon={faPlayCircle} className="card-video-play" />
        <div className="card-img-overlay-text">
          <div>
            <h6 className="fw-semibold text-white mb-1">{data.weight_name}</h6>
            <p className="fs-7 opacity-75">{timeAgo}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
