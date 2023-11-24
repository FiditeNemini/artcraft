import React from "react";
import Card from "../Card";
import AudioPlayer from "components/common/AudioPlayer";

interface AudioCardProps {
  data: any;
}

export default function AudioCard({ data }: AudioCardProps) {
  return (
    <Card padding={true}>
      <h4>{data.weight_name}</h4>
      <AudioPlayer src={data.public_bucket_path} />
    </Card>
  );
}
