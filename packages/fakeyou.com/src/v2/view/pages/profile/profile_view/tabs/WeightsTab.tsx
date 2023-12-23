import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import { faArrowDownWideShort, faFilter } from "@fortawesome/pro-solid-svg-icons";
import SkeletonCard from "components/common/Card/SkeletonCard";
import Pagination from "components/common/Pagination";
import { useListContent } from "hooks";
import { GetWeightsByUser } from "@storyteller/components/src/api/weights/GetWeightsByUser";
import { TempSelect } from "components/common";

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
  const [isLoading] = useState(false);
  const [sd,sdSet] = useState("all");
  const [tts,ttsSet] = useState("all");
  const [vc,vcSet] = useState("all");

  const addSetters = { sdSet, ttsSet, vcSet };

  const [list, listSet] = useState<any[]>([]);
  const weights = useListContent({
    addSetters,
    debug: "Weights tab",
    fetcher: GetWeightsByUser,
    list,
    listSet,
    requestList: true,
    urlParam: username
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    weights.pageChange(selectedItem.selected + 1);
  };

  const filterOptions = [
    { value: "all", label: "All Weights" },
    { value: "tts", label: "Text to Speech" },
    { value: "vc", label: "Voice to Voice" },
    { value: "sd", label: "Image Generation" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostliked", label: "Most Bookmarked" },
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
    currentPage: weights.page
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="d-flex gap-2 flex-grow-1">
          <TempSelect {...{
            icon: faArrowDownWideShort,
            options: sortOptions,
            name: "sort",
            onChange: weights.onChange,
            value: weights.sort
          }}/>
          <TempSelect {...{
            icon: faFilter,
            options: filterOptions,
            name: "filter",
            onChange: weights.onChange,
            value: weights.filter
          }}/>
          {weights.filter === "tts" && (
            <TempSelect {...{
              options: modelTtsOptions,
              name: "tts",
              onChange: weights.onChange,
              value: tts
            }}/>
          )}
          {weights.filter === "sd" && (
            <TempSelect {...{
              options: modelSdOptions,
              name: "sd",
              onChange: weights.onChange,
              value: sd
            }}/>
          )}
          {weights.filter === "vc" && (
            <TempSelect {...{
              options: modelVcOptions,
              name: "vc",
              onChange: weights.onChange,
              value: vc
            }}/>
          )}
        </div>
        <Pagination { ...paginationProps }/>
      </div>
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
          {weights.list.map((data: any, index: number) => {
            let card;
            switch (data.media_type) {
              case "audio":
                card = <AudioCard key={index} data={data} type="weights" />;
                break;
              case "image":
                card = <ImageCard key={index} data={data} type="weights" />;
                break;
              case "video":
                card = <VideoCard key={index} data={data} type="weights" />;
                break;
              default:
                card = <div key={index}>Unsupported media type</div>;
            }
            return (
              <div key={index} className="col-12 col-sm-6 col-xl-4 grid-item">
                {card}
              </div>
            );
          })}
        </MasonryGrid>
      )}

      <div className="d-flex justify-content-end mt-4">
        <Pagination { ...paginationProps }/>
      </div>
    </>
  );
}
