import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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
import { ListMediaFiles } from "@storyteller/components/src/api/media_files/ListMediaFiles";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useBookmarks, useLazyLists } from "hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import prepFilter from "resources/prepFilter";

export default function MediaTab() {
  const { search } = useLocation();
  const urlQueries = new URLSearchParams(search);
  const bookmarks = useBookmarks();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [weightType, weightTypeSet] = useState(
    urlQueries.get("maybe_scoped_weight_type") || "all"
  );
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [list, listSet] = useState<MediaFile[]>([]);
  const media = useLazyLists({
    addQueries: {
      page_size: 24,
      ...prepFilter(weightType, "maybe_scoped_weight_type"),
    },
    addSetters: { weightTypeSet },
    debug: "explore media tab",
    fetcher: ListMediaFiles,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: () => setShowMasonryGrid(true),
    requestList: true,
  });

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
        <div className="d-flex flex-grow-1 flex-wrap gap-2">
          <TempSelect
            {...{
              icon: faArrowDownWideShort,
              options: sortOptions,
              name: "sort",
              onChange: media.onChange,
              value: media.sort,
            }}
          />
          <TempSelect
            {...{
              icon: faFilter,
              options: filterOptions,
              name: "weightType",
              onChange: media.onChange,
              value: weightType,
            }}
          />
        </div>
      </div>
      <AudioPlayerProvider>
        {media.isLoading && !media.list.length ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={media.list.length}
            next={media.getMore}
            hasMore={!media.list.length || !!media.next}
            loader={
              media.list.length !== 0 &&
              media.isLoading && (
                <div className="mt-4 d-flex justify-content-center">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )
            }
            endMessage={
              <p className="text-center mt-4 opacity-75">No more results.</p>
            }
            className="overflow-hidden"
          >
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
                    {media.list.map((data: any, index: number) => {
                      let card;
                      switch (data.media_type) {
                        case "audio":
                          card = (
                            <AudioCard
                              {...{
                                bookmarks,
                                data,
                                type: "media",
                                showCreator: true,
                              }}
                            />
                          );
                          break;
                        case "image":
                          card = (
                            <ImageCard
                              {...{
                                bookmarks,
                                data,
                                type: "media",
                                showCreator: true,
                              }}
                            />
                          );
                          break;
                        case "video":
                          card = (
                            <VideoCard
                              {...{
                                bookmarks,
                                data,
                                type: "media",
                                showCreator: true,
                              }}
                            />
                          );
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
          </InfiniteScroll>
        )}
      </AudioPlayerProvider>
    </>
  );
}
