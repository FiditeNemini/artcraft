import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockMediaData from "./mockMediaData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Select from "components/common/Select";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import InfiniteScroll from "react-infinite-scroll-component";

export default function MediaTab() {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState(mockMediaData);
  const [isLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreData = () => {
    // Simulate a delay (like fetching API)
    setTimeout(() => {
      const moreData = data.concat(
        // Here, create more dummy data
        mockMediaData.map(item => ({ ...item, id: item.token + data.length }))
      );

      setData(moreData);

      if (moreData.length >= mockMediaData.length * 2) {
        setHasMore(false);
      }
    }, 1500);
  };

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
    <>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex gap-2 flex-grow-1">
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
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <div className="mt-4 d-flex justify-content-center">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            }
            dataLength={data.length}
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
                    card = <AudioCard key={index} data={data} type="media" />;
                    break;
                  case "image":
                    card = <ImageCard key={index} data={data} type="media" />;
                    break;
                  case "video":
                    card = <VideoCard key={index} data={data} type="media" />;
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
    </>
  );
}
