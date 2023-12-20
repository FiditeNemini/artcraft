// @ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockWeightsData from "./mockWeightsData";
import { ApiConfig } from "@storyteller/components";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";
import Select from "components/common/Select";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import SkeletonCard from "components/common/Card/SkeletonCard";
import Pagination from "components/common/Pagination";

interface IWeighttModelData {
  token: string;
  weight_name: string;
  public_bucket_path: string;
  likes: Number;
  isLiked: boolean;
  created_at: string;
}

export default function WeightsTab() {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState(mockWeightsData);
  const [isLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.getWeights("?page_size=1000&page_index=0");
    let weightsData = [];

    fetch(endpointUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then(res => res.json())
      .then(res => {
        if (!res.success) {
          return;
        }
        console.log(res);
        res.weights?.forEach((l: any) => {
          weightsData.push({
            token: l?.weight_token,
            weight_name: l?.title,
            media_type: "image",
            public_bucket_path: "/images/dummy-image.jpg",
            likes: l?.likes,
            isLiked: l?.bookmarks,
            created_at: l?.created_at,
          });
        });
        setData(weightsData);
      })
      .catch(e => {});
  }, []);

  const updateRequest = (params: any) => {
    const api = new ApiConfig();
    const endpointUrl = api.getWeights("?page_size=1000&page_index=0" + params);
    let weightsData = [];

    fetch(endpointUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then(res => res.json())
      .then(res => {
        if (!res.success) {
          return;
        }
        console.log(res);
        res.weights?.forEach((l: any) => {
          weightsData.push({
            token: l?.weight_token,
            weight_name: l?.title,
            media_type: "image",
            public_bucket_path: "/images/dummy-image.jpg",
            likes: l?.likes,
            isLiked: l?.bookmarks,
            created_at: l?.created_at,
          });
        });
        setData(weightsData);
      })
      .catch(e => {});
  };

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  const currentItems = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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

    switch (selectedOption.value) {
      case "all":
        updateRequest("");
        break;
      case "tts":
        updateRequest("&weights_category=text_to_speech");
        break;
      case "vc":
        updateRequest("&weights_category=voice_conversion");
        break;
      case "sd":
        updateRequest("&weights_category=image_generation");
        break;
      default:
        updateRequest("");
    }
  };

  const handleOrderChange = (option: any) => {
    const selectedOption = option as { value: string; label: string };

    switch (selectedOption.value) {
      case "oldest":
        updateRequest("&sort_ascending=true");
        break;
      case "newest":
        updateRequest("&sort_ascending=false");
        break;
      case "mostliked":
        updateRequest("&sort_ascending=false");
        break;
      default:
        updateRequest("&sort_ascending=false");
    }
  };

  const handleTtsChange = (option: any) => {
    const selectedOption = option as { value: string; label: string };

    switch (selectedOption.value) {
      case "all":
        updateRequest("&weights_category=text_to_speech");
        break;
      case "tt2":
        updateRequest("&weights_type=hifigan_tt2");
        break;
      default:
        updateRequest("&weights_category=text_to_speec");
    }
  };

  const handleVcChange = (option: any) => {
    const selectedOption = option as { value: string; label: string };

    switch (selectedOption.value) {
      case "all":
        updateRequest("&weights_category=voice_conversion");
        break;
      case "rvc":
        updateRequest("&weights_type=rvc_v2");
        break;
      case "svc":
        console.log(selectedOption.value);
        updateRequest("&weights_type=so_vits_svc");
        break;
      default:
        updateRequest("&weights_category=voice_conversion");
    }
  };

  const handleSdChange = (option: any) => {
    const selectedOption = option as { value: string; label: string };

    switch (selectedOption.value) {
      case "all":
        updateRequest("&weights_category=image_generation");
        break;
      case "lora":
        updateRequest("&weights_type=loRA");
        break;
      case "SD15":
        console.log(selectedOption.value);
        updateRequest("&weights_type=sd_1.5");
        break;
      case "SDXL":
        console.log(selectedOption.value);
        updateRequest("&weights_type=sdxl");
        break;
      default:
        updateRequest("&weights_category=image_generation");
    }
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
            onChange={handleOrderChange}
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
              onChange={handleTtsChange}
            />
          )}
          {selectedFilter === "sd" && (
            <Select
              options={modelSdOptions}
              defaultValue={modelSdOptions[0]}
              isSearchable={false}
              onChange={handleSdChange}
            />
          )}
          {selectedFilter === "vc" && (
            <Select
              options={modelVcOptions}
              defaultValue={modelVcOptions[0]}
              isSearchable={false}
              onChange={handleVcChange}
            />
          )}
        </div>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={data.length}
          onPageChange={handlePageClick}
          currentPage={currentPage}
        />
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
          {currentItems.map((data, index) => {
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
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={data.length}
          onPageChange={handlePageClick}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}
