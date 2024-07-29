import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import React from "react";

interface MediaVideoComponentProps {
  mediaFile?: MediaFile;
}

export default function MediaVideoComponent({
  mediaFile,
}: MediaVideoComponentProps) {
  let mediaLink = mediaFile
    ? new BucketConfig().getGcsUrl(mediaFile.public_bucket_path)
    : "";

  return mediaFile && mediaFile.public_bucket_path ? (
    <video className="rounded" controls width="100%" height="auto">
      <source src={mediaLink} />
      Your browser does not support the video element.
    </video>
  ) : null;
}
