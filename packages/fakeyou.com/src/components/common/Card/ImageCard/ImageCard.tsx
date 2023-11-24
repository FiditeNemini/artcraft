import React from "react";
import Card from "../Card";

interface ImageCardProps {
  data: any;
}

export default function ImageCard({ data }: ImageCardProps) {
  return (
    <Card padding={false}>
      <img
        src={data.public_bucket_path}
        alt={data.weight_name}
        className="img-fluid"
      />
    </Card>
  );
}
