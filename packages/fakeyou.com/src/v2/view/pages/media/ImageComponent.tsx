import React from "react";
import MediaData from "./MediaDataTypes";

interface ImageComponentProps {
  mediaData: MediaData;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ mediaData }) => {
  return (
    <div>
      <img
        src={mediaData.public_bucket_path}
        alt="test" // Make sure to provide alt text
        width="400"
        height="300"
      />
    </div>
  );
};

export default ImageComponent;
