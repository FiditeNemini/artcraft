import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import Pagination from "components/common/Pagination";
import { useBookmarks, useListContent } from "hooks";
import { GetWeightsByUser } from "@storyteller/components/src/api/weights/GetWeightsByUser";
import { TempSelect } from "components/common";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";
import SkeletonCard from "components/common/Card/SkeletonCard";

// interface IWeighttModelData {
//   token: string;
//   weight_name: string;
//   public_bucket_path: string;
//   likes: Number;
//   isLiked: boolean;
//   created_at: string;
// }

export default function WeightsTab({ username }: { username: string }) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [sd, sdSet] = useState("all");
  const [tts, ttsSet] = useState("all");
  const [vc, vcSet] = useState("all");
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const addSetters = { sdSet, ttsSet, vcSet };
  const bookmarks = useBookmarks();

  const [list, listSet] = useState<any[]>([]);
  const weights = useListContent({
    addSetters,
    debug: "Weights tab",
    fetcher: GetWeightsByUser,
    list,
    listSet,
    requestList: true,
    urlParam: username,
    addQueries: { per_page: 24 },
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    weights.pageChange(selectedItem.selected);
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

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: weights.pageCount,
    currentPage: weights.page,
    addQueries: { per_page: 24 },
  };

  const resetMasonryGrid = () => {
    setShowMasonryGrid(false);
    setTimeout(() => setShowMasonryGrid(true), 10);
  };

  const handleSortOrFilterChange = (event: any) => {
    if (weights.onChange) {
      weights.onChange(event);
    }

    // Reset Masonry Grid
    resetMasonryGrid();
  };

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
              value: weights.sort,
            }}
          />
          <TempSelect
            {...{
              icon: faFilter,
              options: filterOptions,
              name: "filter",
              onChange: handleSortOrFilterChange,
              value: weights.filter,
            }}
          />
          {weights.filter === "tts" && (
            <TempSelect
              {...{
                options: modelTtsOptions,
                name: "tts",
                onChange: handleSortOrFilterChange,
                value: tts,
              }}
            />
          )}
          {weights.filter === "sd" && (
            <TempSelect
              {...{
                options: modelSdOptions,
                name: "sd",
                onChange: handleSortOrFilterChange,
                value: sd,
              }}
            />
          )}
          {weights.filter === "vc" && (
            <TempSelect
              {...{
                options: modelVcOptions,
                name: "vc",
                onChange: handleSortOrFilterChange,
                value: vc,
              }}
            />
          )}
        </div>
        <Pagination {...paginationProps} />
      </div>
      { weights.isLoading ? (
        <div className="row gx-3 gy-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <>
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
                  {weights.list.map((data: any, index: number) => {
                    let card;
                    switch (data.weights_category) {
                      case WeightCategory.TTS:
                        card = (
                          <AudioCard {...{
                            bookmarks,
                            data,
                            type: "weights",
                            showCreator: true,
                            showCover: true
                          }} />
                        );
                        break;
                      case WeightCategory.VC:
                        card = (
                          <AudioCard {...{
                            bookmarks,
                            data,
                            type: "weights",
                            showCreator: true,
                            showCover: true
                          }} />
                        );
                        break;
                      case WeightCategory.ZS:
                        card = (
                          <AudioCard {...{
                            bookmarks,
                            data,
                            type: "weights",
                            showCreator: true,
                            showCover: true
                          }} />
                        );
                        break;
                      case WeightCategory.SD:
                        card = (
                          <ImageCard {...{
                            bookmarks,
                            data,
                            type: "weights",
                            showCreator: true
                          }} />
                        );
                        break;
                      case WeightCategory.VOCODER:
                        card = <></>;
                        break;
                      default:
                        card = <div>Unsupported weight type</div>;
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

      <div className="d-flex justify-content-end mt-4">
        <Pagination {...paginationProps} />
      </div>
    </>
  );
}
