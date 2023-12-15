import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockWeightsData from "./mockWeightsData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Select from "components/common/Select";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import SkeletonCard from "components/common/Card/SkeletonCard";

export default function WeightsTab() {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [data] = useState(mockWeightsData);
  const [isLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  const handleFilterChange = (option: any) => {
    const selectedOption = option as { value: string; label: string };
    setSelectedFilter(selectedOption.value);
  };

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
            onChange={handleFilterChange}
          />

          {selectedFilter === "tts" && (
            <Select
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
          )}
        </div>
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
          {data.map((data, index) => {
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
    </>
  );
}
