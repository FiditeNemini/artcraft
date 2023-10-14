import React from "react";
import MediaData from "./MediaDataTypes";

interface MediaImageComponentProps {
  mediaData: MediaData;
}

export default function MediaImageComponent({
  mediaData,
}: MediaImageComponentProps) {
  return (
    <div>
      <img
        src={mediaData.public_bucket_path}
        alt="test"
        width="400"
        height="300"
      />
    </div>
  );
}
