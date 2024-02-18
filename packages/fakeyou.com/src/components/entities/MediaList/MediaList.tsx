import React, { useRef } from "react";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import { ImagePreview, MocapPreview, VideoPreview } from '../CardPreviews';
import { AudioCard, OverlayCard, CardWrapper, WeightCard } from "components/entities";
import { EntityType } from "components/entities/EntityTypes";

interface MediaCardsProps {
  props: any,
  type: string
}

interface Props {
  entityType: EntityType,
  list: MediaFile[],
  success?: boolean
}

const MediaCards = ({ props, type }: MediaCardsProps) => {
  switch (type) {
    case "audio":
      return <CardWrapper {...{ ...props, card: AudioCard, padding: true }}/>;
    case "image":
      return <CardWrapper {...{ ...props, card: OverlayCard, preview: ImagePreview }}/>;
    case "video":
      return <CardWrapper {...{ ...props, card: OverlayCard, preview: VideoPreview }}/>;
    case "bvh": case "glb": case "gltf":
      return <CardWrapper {...{ ...props, card: OverlayCard, preview: MocapPreview }}/>;
    default:
      return <div>Unsupported media type</div>;
  }
};

const WeightsCards = ({ props, type }: MediaCardsProps) => {
  switch (type) {
    case "rvc_v2":
      return <CardWrapper {...{ ...props, card: WeightCard, padding: true }}/>;
    case "tt2":
      return <CardWrapper {...{ ...props, card: WeightCard, padding: true }}/>;
    default:
      return <div>Unsupported media type</div>;
  }
};

export default function MediaList({ entityType, list, success, ...rest }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  return list.length === 0 && success ?
    <div className="text-center mt-4 opacity-75">
      No media created yet.
    </div> : <MasonryGrid {...{ gridRef }}>
      { list.map((data: any, key: number) => {
        let props = { data, type: "media", ...rest };
        return <div {...{
          className: "col-12 col-sm-6 col-xl-4 grid-item",
          key,
        }}>
          {
            [ null,
              <MediaCards {...{ type: data.media_type, props }} />,
              <WeightsCards {...{ type: data.weight_type, props }} />
            ][entityType]
          }
        </div>;
      }) }
    </MasonryGrid>;
};