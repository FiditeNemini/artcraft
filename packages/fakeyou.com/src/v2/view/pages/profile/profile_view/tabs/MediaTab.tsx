import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import { TempSelect } from "components/common";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import Pagination from "components/common/Pagination";

import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useListContent } from "hooks";

export default function MediaTab({ username }: { username: string }) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);

  const [list, listSet] = useState<MediaFile[]>([]);
  const media = useListContent({
    // addQueries: { abc: "anything" }, an example
    fetcher: GetMediaByUser,
    list,
    listSet,
    requestList: true,
    urlParam: username,
    addQueries: { per_page: 24 },
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    media.pageChange(selectedItem.selected);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: media.pageCount,
    currentPage: media.page,
  };

  const resetMasonryGrid = () => {
    setShowMasonryGrid(false);
    setTimeout(() => setShowMasonryGrid(true), 10);
  };

  const handleSortOrFilterChange = (event: any) => {
    if (media.onChange) {
      media.onChange(event);
    }

    // Reset Masonry Grid
    resetMasonryGrid();
  };

  const filterOptions = [
    { value: "all", label: "All Media" },
    { value: "image", label: "Images" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
  ];

  const sortOptions = [
    { value: false, label: "Newest" },
    { value: true, label: "Oldest" },
    // { value: "mostliked", label: "Most Liked" },
  ];

  return (
    <>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex gap-2 flex-grow-1">
          <TempSelect
            {...{
              icon: faArrowDownWideShort,
              options: sortOptions,
              name: "sort",
              onChange: handleSortOrFilterChange,
              value: media.sort,
            }}
          />
          <TempSelect
            {...{
              icon: faFilter,
              options: filterOptions,
              name: "filter",
              onChange: handleSortOrFilterChange,
              value: media.filter,
            }}
          />
        </div>
        <Pagination {...paginationProps} />
      </div>
      <AudioPlayerProvider>
        { media.isLoading ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            {showMasonryGrid && (
              <>
                {media.list.length === 0 && media.status === 3 ? (
                  <div className="text-center mt-4 opacity-75">
                    No media created yet.
                  </div>
                ) : (
                  <MasonryGrid
                    gridRef={gridContainerRef}
                    onLayoutComplete={() => console.log("Layout complete!")}
                  >
                    {media.list.map((data: MediaFile, index: number) => {
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
                        <div
                          key={index}
                          className="col-12 col-sm-6 col-xl-4 grid-item"
                        >
                          {card}
                        </div>
                      );
                    })}
                  </MasonryGrid>
                )}
              </>
            )}
          </>
        )}
      </AudioPlayerProvider>

      <div className="d-flex justify-content-end mt-4">
        <Pagination {...paginationProps} />
      </div>
    </>
  );
}
