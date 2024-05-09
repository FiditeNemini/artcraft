import React, { useRef } from "react";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import { ImagePreview, MocapPreview, VideoPreview } from "../CardPreviews";
import {
  AudioCard,
  OverlayCard,
  CardWrapper,
  WeightCard,
} from "components/entities";
import { EntityType } from "components/entities/EntityTypes";

interface MediaCardsProps {
  props: any;
  type: string;
}

interface Props {
  entityType: EntityType;
  list: MediaFile[];
  success?: boolean;
}

const Cards = ({ props, type }: MediaCardsProps) => {
  switch (type) {
    case "audio":
      return <CardWrapper {...{ ...props, card: AudioCard, padding: true }} />;
    case "image":
      return (
        <CardWrapper
          {...{ ...props, card: OverlayCard, preview: ImagePreview }}
        />
      );
    case "video":
      return (
        <CardWrapper
          {...{ ...props, card: OverlayCard, preview: VideoPreview }}
        />
      );
    case "bvh":
    case "glb":
    case "gltf":
    case "scene_ron":
      return (
        <CardWrapper
          {...{ ...props, card: OverlayCard, preview: MocapPreview }}
        />
      );
    case "rvc_v2":
      return <CardWrapper {...{ ...props, card: WeightCard, padding: true }} />;
    case "tt2":
      return <CardWrapper {...{ ...props, card: WeightCard, padding: true }} />;
    default:
      return <div>Unsupported type</div>;
  }
};

export default function MediaList({
  entityType,
  list,
  success,
  ...rest
}: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  // console.log("🪼",{ entityType, list, success, rest });

  return list.length === 0 && success ? (
    <div className="text-center mt-4 opacity-75">No media created yet.</div>
  ) : (
    <MasonryGrid {...{ gridRef }}>
      {list.map((data: any, key: number) => {
        console.log("🐡", data);
        let props = {
          data,
          type: data.media_type ? "media" : "weight",
          ...rest,
        };
        return (
          <div
            {...{
              className:
                "col-12 col-sm-6 col-lg-6 col-xl-4 col-xxl-3 grid-item",
              key,
            }}
          >
            <Cards {...{ type: data.media_type || data.weight_type, props }} />
            {
              // [ null,
              //   <MediaCards {...{ type: data.media_type, props }} />,
              //   <WeightsCards {...{ type: data.weight_type, props }} />
              // ][entityType]
            }
          </div>
        );
      })}
    </MasonryGrid>
  );
}
