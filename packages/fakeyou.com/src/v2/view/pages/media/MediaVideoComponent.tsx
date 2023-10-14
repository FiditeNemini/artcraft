import React from "react";
import MediaData from "./MediaDataTypes";

interface MediaVideoComponentProps {
  mediaData: MediaData;
}

export default function MediaVideoComponent({
  mediaData,
}: MediaVideoComponentProps) {
  return (
    <video className="rounded" controls width="100%" height="auto">
      <source src={mediaData.public_bucket_path} />
      Your browser does not support the video element.
    </video>
  );
}
