import React from "react";
import AudioCard from "./AudioCard";
import ImageCard from "./ImageCard";
import VideoCard from "./VideoCard";

interface Props {
  props: any,
  type: string
}

export default function MediaCards({ props, type }: Props) {
  switch (type) {
    case "audio":
      return <AudioCard {...props} />;
    case "image":
      return <ImageCard {...props} />;
    case "video":
      return <VideoCard {...props} />;
    default:
      return <div>Unsupported media type</div>;
  }
};