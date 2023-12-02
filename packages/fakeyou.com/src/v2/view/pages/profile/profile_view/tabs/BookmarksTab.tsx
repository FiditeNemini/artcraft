import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Panel from "components/common/Panel";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import mockWeightsData from "./mockWeightsData";

export default function BookmarksTab() {
  const [data] = useState(mockWeightsData);
  const [isLoading] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Panel clear={true} padding={true}>
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
                  card = <AudioCard key={index} data={data} type="weights" />;
                  break;
                case "image":
                  card = <ImageCard key={index} data={data} type="weights" />;
                  break;
                case "video":
                  card = <VideoCard key={index} data={data} type="weights" />;
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
