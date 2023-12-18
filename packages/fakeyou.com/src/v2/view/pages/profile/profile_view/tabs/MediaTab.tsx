import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
// import mockMediaData from "./mockMediaData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Select from "components/common/Select";
import { faArrowDownWideShort, faFilter } from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import Pagination from "components/common/Pagination";

import useProfileRequests from "../../useProfileRequests";

export default function MediaTab() {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading] = useState(false);

  const { mediaList, mediaPage, mediaPageChange, mediaPageCount } = useProfileRequests({ requestMedia: true });

  const handlePageClick = (selectedItem: { selected: number }) => {
    mediaPageChange(selectedItem.selected + 1);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: mediaPageCount - 1,
    currentPage: mediaPage - 1
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
        <Pagination { ...paginationProps }/>
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
            {mediaList.map((data, index) => {
              let card;
              switch (data.media_type) {
                case "audio":
                  card = <AudioCard data={data} type="media" />;
                  break;
                case "image":
                  card = <ImageCard data={data} type="media" />;
                  break;
                case "video":
                  card = <VideoCard data={data} type="media" />;
                  break;
                default:
                  card = <div>Unsupported media type</div>;
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

      <div className="d-flex justify-content-end mt-4">
        <Pagination { ...paginationProps }/>
      </div>
    </>
  );
}
