import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import React from "react";

interface MediaImageComponentProps {
  mediaFile: MediaFile;
}

export default function MediaImageComponent({
  mediaFile,
}: MediaImageComponentProps) {
  const imagePath = new BucketConfig().getGcsUrl(mediaFile.public_bucket_path);
  return (
    <div>
      <img src={imagePath} alt="test" />
    </div>
  );
}
