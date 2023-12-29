import React, { useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import MediaCards from "components/common/Card/MediaCards";
import SkeletonCard from "components/common/Card/SkeletonCard";
import { TempSelect } from "components/common";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import Pagination from "components/common/Pagination";

import { useBookmarks, useListContent } from "hooks";
import { GetBookmarksByUser } from "@storyteller/components/src/api/bookmarks/GetBookmarksByUser";

export default function BookmarksTab({ username }: { username: string }) {
  const { pathname: origin } = useLocation();
  const bookmarks = useBookmarks();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [sd, sdSet] = useState("all");
  const [tts, ttsSet] = useState("all");
  const [vc, vcSet] = useState("all");
  const [list, listSet] = useState<any[]>([]);
  // const resetMasonryGrid = () => {
  //   setShowMasonryGrid(false);
  //   setTimeout(() => setShowMasonryGrid(true), 10);
  // };
  const {
    filter,
    isLoading,
    list: dataList,
    onChange,
    page,
    pageChange,
    pageCount,
    sort,
    status,
  } = useListContent({
    addQueries: { page_size: 24 },
    addSetters: { sdSet, ttsSet, vcSet },
    debug: "bookmarks tab",
    fetcher: GetBookmarksByUser,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: () => setShowMasonryGrid(true),
    requestList: true,
    urlParam: username,
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    pageChange(selectedItem.selected);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount,
    currentPage: page,
  };

  const filterOptions = [
    { value: "all", label: "All Weights" },
    { value: "tts", label: "Text to Speech" },
    { value: "vc", label: "Voice to Voice" },
    { value: "sd", label: "Image Generation" },
  ];

  const sortOptions = [
    { value: false, label: "Newest" },
    { value: true, label: "Oldest" },
    // { value: "mostliked", label: "Most Liked" },
  ];

  const modelTtsOptions = [
    { value: "all", label: "All Types" },
    { value: "tt2", label: "Tacotron 2" },
  ];

  const modelVcOptions = [
    { value: "all", label: "All Types" },
    { value: "rvc", label: "RVCv2" },
    { value: "svc", label: "SoVitsSvc" },
  ];

  const modelSdOptions = [
    { value: "all", label: "All Types" },
    { value: "lora", label: "LoRA" },
    { value: "SD15", label: "SD 1.5" },
    { value: "SDXL", label: "SD XL" },
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
              onChange,
              value: sort,
            }}
          />
          <TempSelect
            {...{
              icon: faFilter,
              options: filterOptions,
              name: "filter",
              onChange,
              value: filter,
            }}
          />
          {filter === "tts" && (
            <TempSelect
              {...{
                options: modelTtsOptions,
                name: "tts",
                onChange,
                value: tts,
              }}
            />
          )}
          {filter === "sd" && (
            <TempSelect
              {...{
                options: modelSdOptions,
                name: "sd",
                onChange,
                value: sd,
              }}
            />
          )}
          {filter === "vc" && (
            <TempSelect
              {...{
                options: modelVcOptions,
                name: "vc",
                onChange,
                value: vc,
              }}
            />
          )}
        </div>
        <Pagination {...paginationProps} />
      </div>
      {isLoading ? (
        <div className="row gx-3 gy-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        showMasonryGrid && (
          <>
            {dataList.length === 0 && status === 3 ? (
              <div className="text-center mt-4 opacity-75">
                No bookmarked weights yet.
              </div>
            ) : (
              <MasonryGrid
                gridRef={gridContainerRef}
                onLayoutComplete={() => console.log("Layout complete!")}
              >
                {dataList.map((data: any, key: number) => {
                  let props = { bookmarks, data, origin, type: "weights" };

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
        )
      )}

      <div className="d-flex justify-content-end mt-4">
        <Pagination {...paginationProps} />
      </div>
    </>
  );
}
