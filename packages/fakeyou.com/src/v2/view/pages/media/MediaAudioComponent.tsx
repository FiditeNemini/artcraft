import MediaData from "./MediaDataTypes";
import React from "react";
import MediaAudioPlayer from "./MediaAudioPlayer";

interface MediaAudioComponentProps {
  mediaData: MediaData;
}

export default function MediaAudioComponent({
  mediaData,
}: MediaAudioComponentProps) {
  return (
    <div className="w-100">
      <MediaAudioPlayer mediaData={mediaData} />
    </div>
  );
}
