import React, { useRef } from "react";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
// import MediaCards from "components/common/Card/MediaCards";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import { BvhCard, CardWrapper } from "components/entities";

import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"; // for now
import { faPersonWalking } from "@fortawesome/pro-solid-svg-icons";

interface MediaCardsProps {
  props: any,
  type: string
}

interface Props {
  list: MediaFile[],
  success?: boolean
}

const MocapPreview = () => <Icon {...{ className: "card-img", icon: faPersonWalking }}/>;

const MediaCards = ({ props, type }: MediaCardsProps) => {
  switch (type) {
    case "audio":
      return <AudioCard {...props} />;
    case "image":
      return <ImageCard {...props} />;
    case "video":
      return <VideoCard {...props} />;
    case "bvh":
      return <CardWrapper {...{ ...props, card: BvhCard, preview: MocapPreview }}/>
    default:
      return <div>Unsupported media type</div>;
  }
};

export default function MediaList({ list, success, ...rest }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  return list.length === 0 && success ?
    <div className="text-center mt-4 opacity-75">
      No media created yet.
    </div> : <MasonryGrid {...{ gridRef }}>
      { list.map((data: MediaFile, key: number) => {
        let props = { data, type: "media", ...rest };
        return <div {...{
          className: "col-12 col-sm-6 col-xl-4 grid-item",
          key,
        }}>
          <MediaCards {...{ type: data.media_type, props }} />
        </div>;
      }) }
    </MasonryGrid>;
};