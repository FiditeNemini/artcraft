import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";
import useTimeAgo from "hooks/useTimeAgo";
import Badge from "components/common/Badge";

interface AudioCardProps {
  data: any;
  to: string;
}

export default function AudioCard({ data, to }: AudioCardProps) {
  const history = useHistory();

  const handleCardClick = () => {
    history.push(to);
  };

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  const timeAgo = useTimeAgo(data.created_at);

  return (
    <Card padding={true} onClick={handleCardClick}>
      <div className="mb-3">
        <Badge label="Audio" color="teal" />
        <h6 className="fw-semibold text-white mb-1 mt-3">{data.weight_name}</h6>
        <p className="fs-7 opacity-75">{timeAgo}</p>
      </div>

      <div onClick={handleInnerClick}>
        <AudioPlayer src={data.public_bucket_path} />
      </div>
    </Card>
  );
}
