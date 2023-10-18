import React from "react";
import MediaAudioPlayer from "./MediaAudioPlayer";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";

interface MediaAudioComponentProps {
  mediaFile: MediaFile;
}

export default function MediaAudioComponent({
  mediaFile,
}: MediaAudioComponentProps) {
  return (
    <div className="w-100">
      <MediaAudioPlayer mediaFile={mediaFile} />
    </div>
  );
}
