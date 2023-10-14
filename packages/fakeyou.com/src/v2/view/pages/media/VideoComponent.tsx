import React from "react";
import MediaData from "./MediaDataTypes";
interface VideoComponentProps {
  mediaData: MediaData;
}

export default function VideoComponent({ mediaData }: VideoComponentProps) {
  return (
    <video className="rounded" controls width="100%" height="auto">
      <source src={mediaData.public_bucket_path} />
      Your browser does not support the video element.
    </video>
  );
}
