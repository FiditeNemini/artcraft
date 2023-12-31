import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import WeightsCards from "components/common/Card/WeightsCards";
import { TempSelect } from "components/common";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import { ListWeights } from "@storyteller/components/src/api/weights/ListWeights";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import InfiniteScroll from "react-infinite-scroll-component";
import { useBookmarks, useLazyLists } from "hooks";

export default function WeightsTab() {
  const bookmarks = useBookmarks();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [list, listSet] = useState<Weight[]>([]);
  const weights = useLazyLists({
    fetcher: ListWeights,
    filterKey: "weights_category",
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: () => setShowMasonryGrid(true),
    requestList: true,
    addQueries: { page_size: 12 },
  });

  const filterOptions = [
    { value: "all", label: "All Weights" },
    { value: "tts", label: "Text to Speech" },
    { value: "vc", label: "Voice to Voice" },
    { value: "sd", label: "Image Generation" },
  ];

  const sortOptions = [
    { value: false, label: "Newest" },
    { value: true, label: "Oldest" },
    // { value: "mostliked", label: "Most Bookmarked" },
  ];

  // const modelTtsOptions = [
  //   { value: "all", label: "All Types" },
  //   { value: "tt2", label: "Tacotron 2" },
  // ];

  // const modelVcOptions = [
  //   { value: "all", label: "All Types" },
  //   { value: "rvc", label: "RVCv2" },
  //   { value: "svc", label: "SoVitsSvc" },
  // ];

  // const modelSdOptions = [
  //   { value: "all", label: "All Types" },
  //   { value: "lora", label: "LoRA" },
  //   { value: "SD15", label: "SD 1.5" },
  //   { value: "SDXL", label: "SD XL" },
  // ];

  return (
    <>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex flex-grow-1">
          <TempSelect
            {...{
              icon: faArrowDownWideShort,
              options: sortOptions,
              name: "sort",
              onChange: weights.onChange,
              value: weights.sort,
            }}
          />
          <TempSelect
            {...{
              icon: faFilter,
              options: filterOptions,
              name: "filter",
              onChange: weights.onChange,
              value: weights.filter,
            }}
          />
          {/* {selectedFilter === "tts" && (
            <TempSelect
              options={modelTtsOptions}
              defaultValue={modelTtsOptions[0]}
              isSearchable={false}
            />
          )}
          {selectedFilter === "sd" && (
            <Select
              options={modelSdOptions}
              defaultValue={modelSdOptions[0]}
              isSearchable={false}
            />
          )}
          {selectedFilter === "vc" && (
            <Select
              options={modelVcOptions}
              defaultValue={modelVcOptions[0]}
              isSearchable={false}
            />
          )} */}
        </div>
      </div>
      <AudioPlayerProvider>
        {weights.isLoading && !weights.list.length ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={weights.list.length}
            next={weights.getMore}
            hasMore={!weights.list.length || !!weights.next}
            loader={
              weights.list.length !== 0 &&
              weights.isLoading && (
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
                {weights.list.length === 0 && weights.status === 3 ? (
                  <div className="text-center mt-4 opacity-75">
                    No weight created yet.
                  </div>
                ) : (
                  <MasonryGrid
                    gridRef={gridContainerRef}
                    onLayoutComplete={() => console.log("Layout complete!")}
                  >
                    {weights.list.map((data: any, key: number) => {
                      let props = {
                        bookmarks,
                        data,
                        showCreator: true,
                        type: "weights",
                      };

                      return (
                        <div
                          {...{
                            className: "col-12 col-sm-6 col-xl-4 grid-item",
                            key,
                          }}
                        >
                          <WeightsCards
                            {...{ type: data.weight_category, props }}
                          />
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
