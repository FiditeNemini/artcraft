import React from "react";
import "./WeightCoverImage.scss";

interface AudioWeightCoverImageProps {
  src: string;
  alt?: string;
  height?: number;
  width?: number;
}

export default function WeightCoverImage({
  src,
  alt,
  height = 100,
  width = 100,
}: AudioWeightCoverImageProps) {
  const containerStyle = {
    height: `${height}px`,
    width: `${width}px`,
  };

  return (
    <div className="cover-img" style={containerStyle}>
      <img src={src} alt={alt} />
    </div>
  );
}
