import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";

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

  return (
    <Card padding={true} onClick={handleCardClick}>
      <h6 className="fw-semibold text-white mb-3">{data.weight_name}</h6>
      <div onClick={handleInnerClick}>
        <AudioPlayer src={data.public_bucket_path} />
      </div>
    </Card>
  );
}
