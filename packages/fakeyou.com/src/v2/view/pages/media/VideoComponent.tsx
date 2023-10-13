import React from "react";
import MediaData from "./MediaDataTypes";
interface VideoComponentProps {
  mediaData: MediaData;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ mediaData }) => {
  return (
    <div>
      <video controls width="640" height="360">
        <source src={mediaData.public_bucket_path} />
        Your browser does not support the video element.
      </video>
    </div>
  );
};

export default VideoComponent;
