import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockMediaData from "./mockMediaData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Panel from "components/common/Panel";
import { Select } from "components/common/Inputs/Inputs";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";

export default function MediaTab() {
  const [data, setData] = useState(mockMediaData);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const filterOptions = [
    { value: "all", label: "All Media" },
    { value: "images", label: "Images" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostliked", label: "Most Liked" },
  ];

  return (
    <Panel clear={true} padding={true}>
      <div className="d-flex gap-2 mb-3">
        <Select
          icon={faArrowDownWideShort}
          options={sortOptions}
          defaultValue={sortOptions[0]}
          isSearchable={false}
        />
        <Select
          icon={faFilter}
          options={filterOptions}
          defaultValue={filterOptions[0]}
          isSearchable={false}
        />
      </div>
      <AudioPlayerProvider>
        {isLoading ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <MasonryGrid
            gridRef={gridContainerRef}
            onLayoutComplete={() => console.log("Layout complete!")}
          >
            {data.map((data, index) => {
              let card;
              switch (data.media_type) {
                case "audio":
                  card = <AudioCard key={index} data={data} type="media" />;
                  break;
                case "image":
                  card = <ImageCard key={index} data={data} type="media" />;
                  break;
                case "video":
                  card = <VideoCard key={index} data={data} />;
                  break;
                default:
                  card = <div key={index}>Unsupported media type</div>;
              }
              return (
                <div key={index} className="col-12 col-sm-6 col-xl-4 grid-item">
                  {card}
                </div>
              );
            })}
          </MasonryGrid>
        )}
      </AudioPlayerProvider>
    </Panel>
  );
}
