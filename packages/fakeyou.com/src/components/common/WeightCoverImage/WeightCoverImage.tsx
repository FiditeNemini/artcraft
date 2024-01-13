import React from "react";
import "./WeightCoverImage.scss";
interface WeightCoverImageProps {
  src?: string;
  alt?: string;
  height?: number;
  width?: number;
  coverIndex?: number;
}

export default function WeightCoverImage({
  src,
  alt,
  height = 100,
  width = 100,
  coverIndex,
}: WeightCoverImageProps) {
  const containerStyle = {
    height: `${height}px`,
    width: `${width}px`,
    minWidth: `${width}px`,
  };

  let image = `/images/default-covers/${coverIndex || 0}.webp`;
  if (src) {
    image = src;
  }

  return (
    <div className="cover-img" style={containerStyle}>
      <img src={image} alt={alt || "Model Weight Cover"} />
    </div>
  );
}
