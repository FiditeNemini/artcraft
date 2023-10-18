import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import React from "react";

interface MediaImageComponentProps {
  mediaFile: MediaFile;
}

export default function MediaImageComponent({
  mediaFile,
}: MediaImageComponentProps) {
  return (
    <div>
      <img
        src={mediaFile.public_bucket_path}
        alt="test"
        width="400"
        height="300"
      />
    </div>
  );
}
