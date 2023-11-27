import React, { useEffect, useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockData from "./mockData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Panel from "components/common/Panel";
import { Select } from "components/common/Inputs/Inputs";
import { faFilter } from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import InfiniteScroll from "react-infinite-scroll-component";

export default function MediaTab() {
  const itemsPerPage = 10; // Items per page
  const initialData = mockData.slice(0, itemsPerPage); // Initial 10 items
  const [data, setData] = useState(initialData);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); //start from second page
  const [isLoading, setIsLoading] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchMoreData = () => {
    if (data.length >= mockData.length) {
      setHasMore(false);
      return;
    }

    // Simulate an API fetch
    setTimeout(() => {
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const nextItems = mockData.slice(startIndex, endIndex);
      setData(data.concat(nextItems));
      setPage(page + 1);
    }, 1500);
  };

  const options = [
    { value: "all", label: "All Media" },
    { value: "images", label: "Images" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
  ];

  return (
    <Panel clear={true} padding={true}>
      <div className="d-flex mb-3">
        <Select
          icon={faFilter}
          options={options}
          defaultValue={options[0]}
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
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            endMessage={<p style={{ textAlign: "center" }}>No more media</p>}
            className="overflow-hidden"
          >
            <MasonryGrid
              gridRef={gridContainerRef}
              onLayoutComplete={() => console.log("Layout complete!")}
            >
              {data.map((data, index) => {
                let card;
                switch (data.media_type) {
                  case "audio":
                    card = <AudioCard key={index} data={data} />;
                    break;
                  case "image":
                    card = <ImageCard key={index} data={data} />;
                    break;
                  case "video":
                    card = <VideoCard key={index} data={data} />;
                    break;
                  default:
                    card = <div key={index}>Unsupported media type</div>;
                }
                return (
                  <div
                    key={index}
                    className="col-12 col-sm-6 col-xl-4 grid-item"
                  >
                    {card}
                  </div>
                );
              })}
            </MasonryGrid>
          </InfiniteScroll>
        )}
      </AudioPlayerProvider>
    </Panel>
  );
}
