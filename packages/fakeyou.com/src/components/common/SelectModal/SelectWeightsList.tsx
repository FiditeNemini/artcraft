import React, { useRef, useState } from "react";
import MasonryGrid from "../MasonryGrid/MasonryGrid";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLazyLists } from "hooks";
import prepFilter from "resources/prepFilter";
import WeightsCards from "../Card/WeightsCards";
import { ListWeights } from "@storyteller/components/src/api/weights/ListWeights";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";

interface SelectWeightsListProps {
  weightType: string;
  listKey: string;
  onResultSelect?: (data:{token:string, title:string}) => void;
}

export default function SelectWeightsList({
  weightType,
  listKey,
  onResultSelect,
}: SelectWeightsListProps) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [list, listSet] = useState<Weight[]>([]);

  const weights = useLazyLists({
    addQueries: {
      page_size: 9,
      ...prepFilter(weightType, "weight_type"),
    },
    debug: "Weights List",
    fetcher: ListWeights,
    list,
    listSet,
    requestList: true,
    disableUrlQueries: true,
  });

  return (
    <div className="searcher-container in-modal" id={listKey}>
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
        scrollableTarget={listKey}
        scrollThreshold={0.95}
      >
        <>
          {weights.list.length === 0 && weights.status === 3 ? (
            <div className="text-center opacity-75">No weight created yet.</div>
          ) : (
            <MasonryGrid
              gridRef={gridContainerRef}
              onLayoutComplete={() => console.log("Layout complete!")}
            >
              {weights.list.map((data: any, key: number) => {
                let props = {
                  data,
                  showCreator: true,
                  type: "weights",
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
                    <WeightsCards {...{ type: data.weight_category, props }} />
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
