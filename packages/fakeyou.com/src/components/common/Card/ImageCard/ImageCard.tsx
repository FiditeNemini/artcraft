import React from "react";
import { useHistory } from "react-router-dom";
import Card from "../Card";

interface ImageCardProps {
  data: any;
  to: string;
}

export default function ImageCard({ data, to }: ImageCardProps) {
  const history = useHistory();

  const handleCardClick = () => {
    history.push(to);
  };

  // const handleInnerClick = (event: any) => {
  //   event.stopPropagation();
  // };

  return (
    <Card padding={false} onClick={handleCardClick}>
      <img
        src={data.public_bucket_path}
        alt={data.weight_name}
        className="card-img"
      />
      <div className="card-image-overlay">
        <div className="card-image-gradient"></div>
        <div className="card-image-overlay-text">{data.weight_name}</div>
      </div>
    </Card>
  );
}
