import React, { memo, useRef, useState } from "react";

import { useListContent, useSession } from "hooks";

import {
  MediaFileType,
  GetMediaByUser
} from "@storyteller/components/src/api";

import { 
  MasonryGrid,
  MediaCards,
  Pagination,
  SkeletonCard,
  NonRouteTabs
} from "components/common";

import { SelectModalData, SelectModalV2} from "../SelectModal";

import prepFilter from "resources/prepFilter";
import { StringLiteral } from "typescript";

export default memo(function SelectModalVideoTabs({
  debug = false,
  modalTitle,
  inputLabel,
  onSelect,
}: {
  debug?: boolean;
  modalTitle: string;
  inputLabel: string;
  onSelect?: (data:SelectModalData) => void;
}) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [list, listSet] = useState<MediaFileType[]>([]);
  const { user } = useSession();

  const media = useListContent({
    addQueries: {
      page_size: 9,
      ...prepFilter("mediaType", "filter_media_type"),
    },
    urlUpdate: false,
    debug: debug ? "Video List" : undefined,
    fetcher: GetMediaByUser,
    list,
    listSet,
    requestList: true,
    urlParam: user?.username || ""
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    media.pageChange(selectedItem.selected);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: media.pageCount,
    currentPage: media.page,
  };

  return (
    <SelectModalV2
      modalTitle={modalTitle}
      // searcher={true}
    >
      <p>children</p>
      {/* <div className="searcher-container in-modal" id={listKey}>
          <Pagination {...paginationProps} />
          {media.isLoading ? (
            <div className="row gx-3 gy-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
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
                  {media.list.map((data: MediaFileType, key: number) => {
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
          )}

        <div className="d-flex justify-content-end mt-4">
          <Pagination {...paginationProps} />
        </div>
      </div> */}
    </SelectModalV2>
  );
});
