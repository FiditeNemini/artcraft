import React from "react";
import "./WeightCoverImage.scss";

interface WeightCoverImageProps {
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
}: WeightCoverImageProps) {
  const containerStyle = {
    height: `${height}px`,
    width: `${width}px`,
    minWidth: `${width}px`,
  };

  return (
    <div className="cover-img" style={containerStyle}>
      <img src={src} alt={alt} />
    </div>
  );
}
