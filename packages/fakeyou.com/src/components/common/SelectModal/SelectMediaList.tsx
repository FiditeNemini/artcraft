import React, { useRef, useState } from "react";
import MasonryGrid from "../MasonryGrid/MasonryGrid";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLazyLists } from "hooks";
import prepFilter from "resources/prepFilter";
import MediaCards from "../Card/MediaCards";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import { ListMediaFiles } from "@storyteller/components/src/api/media_files/ListMediaFiles";

interface SelectMediaListProps {
  mediaType: string;
  listKey: string;
  onResultSelect?: (data:{token:string, title:string}) => void;
}

export default function SelectMediaList({
  mediaType,
  listKey,
  onResultSelect,
}: SelectMediaListProps) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [list, listSet] = useState<MediaFile[]>([]);

  const media = useLazyLists({
    addQueries: {
      page_size: 9,
      ...prepFilter(mediaType, "filter_media_type"),
    },
    debug: "Media List",
    fetcher: ListMediaFiles,
    list,
    listSet,
    requestList: true,
    disableUrlQueries: true,
  });

  return (
    <div className="searcher-container in-modal" id={listKey}>
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
        scrollableTarget={listKey}
        scrollThreshold={0.95}
      >
        <>
          {media.list.length === 0 && media.status === 3 ? (
            <div className="text-center opacity-75">No media created yet.</div>
          ) : (
            <MasonryGrid
              gridRef={gridContainerRef}
              onLayoutComplete={() => console.log("Layout complete!")}
            >
              {media.list.map((data: any, key: number) => {
                let props = {
                  data,
                  showCreator: true,
                  type: "media",
                  inSelectModal: true,
                  onResultSelect,
                };

                return (
                  <div
                    {...{
                      className: "col-12 col-sm-6 col-xl-4 grid-item",
                      key,
                    }}
                  >
                    <MediaCards {...{ type: data.media_type, props }} />
                  </div>
                );
              })}
            </MasonryGrid>
          )}
        </>
      </InfiniteScroll>
    </div>
  );
}
