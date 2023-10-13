import MediaData from "./MediaDataTypes";

import React from "react";

interface AudioComponentProps {
  mediaData: MediaData;
}

const AudioComponent: React.FC<AudioComponentProps> = ({ mediaData }) => {
  return (
    <div>
      <audio controls>
        <source src={mediaData.public_bucket_path} />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioComponent;
