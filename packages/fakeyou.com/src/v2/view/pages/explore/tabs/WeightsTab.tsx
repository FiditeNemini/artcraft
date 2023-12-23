import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
// import VideoCard from "components/common/Card/VideoCard";
import { TempSelect } from "components/common";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import { ListWeights } from "@storyteller/components/src/api/weights/ListWeights";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { useLazyLists } from "hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";

export default function WeightsTab() {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading] = useState(false);

  const [list, listSet] = useState<Weight[]>([]);
  const weights = useLazyLists({
    fetcher: ListWeights,
    list,
    listSet,
    requestList: true,
  });

  const filterOptions = [
    { value: "all", label: "All Weights" },
    { value: "images", label: "Image Generation" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostliked", label: "Most Liked" },
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
        </div>
      </div>
      <AudioPlayerProvider>
        {isLoading ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={weights.list.length}
            next={weights.getMore}
            hasMore={!weights.list.length || !!weights.next}
            loader={
              <div className="mt-4 d-flex justify-content-center">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            }
            endMessage={
              <p className="text-center mt-4 opacity-75">No more results.</p>
            }
            className="overflow-hidden"
          >
            <MasonryGrid
              gridRef={gridContainerRef}
              onLayoutComplete={() => console.log("Layout complete!")}
            >
              {weights.list.map((data: any, index: number) => {
                let card;
                switch (data.weights_category) {
                  case WeightCategory.TTS:
                    card = (
                      <AudioCard
                        key={index}
                        data={data}
                        type="weights"
                        showCreator={true}
                        showCover={true}
                      />
                    );
                    break;
                  case WeightCategory.VC:
                    card = (
                      <AudioCard
                        key={index}
                        data={data}
                        type="weights"
                        showCreator={true}
                        showCover={true}
                      />
                    );
                    break;
                  case WeightCategory.ZS:
                    card = (
                      <AudioCard
                        key={index}
                        data={data}
                        type="weights"
                        showCreator={true}
                        showCover={true}
                      />
                    );
                    break;
                  case WeightCategory.SD:
                    card = (
                      <ImageCard
                        key={index}
                        data={data}
                        type="weights"
                        showCreator={true}
                      />
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
          </InfiniteScroll>
        )}
      </AudioPlayerProvider>
    </>
  );
}
