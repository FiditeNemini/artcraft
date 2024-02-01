import React from "react";
import AudioCard from "./AudioCard";
import ImageCard from "./ImageCard";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";

interface Props {
  props: any;
  type: string;
}

export default function WeightsCards({ props, type }: Props) {
  switch (type) {
    case WeightCategory.TTS:
    case WeightCategory.VC:
    case WeightCategory.ZS:
      return <AudioCard { ...props} showCover />;
    case WeightCategory.SD:
      return <ImageCard {...props} />;
    default:
      return <div>Unsupported media type</div>;
  }
}
