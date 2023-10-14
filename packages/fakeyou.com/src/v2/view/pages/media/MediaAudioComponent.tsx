import MediaData from "./MediaDataTypes";
import React from "react";
import AudioPlayer from "./MediaAudioPlayer";

interface MediaAudioComponentProps {
  mediaData: MediaData;
}

export default function MediaAudioComponent({
  mediaData,
}: MediaAudioComponentProps) {
  return (
    <div className="w-100">
      <AudioPlayer mediaData={mediaData} />
    </div>
  );
}
