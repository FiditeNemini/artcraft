import { ListFeaturedWeights, Weight } from "@storyteller/components/src/api";
import { useListContent } from "hooks";
import React, { useRef, useState } from "react";
// import prepFilter from "resources/prepFilter";
import { MasonryGrid, WeightsCards } from "components/common";

interface ExploreTtsProps {
  onResultSelect?: (data: any) => void;
}

const ExploreTts = ({ onResultSelect }: ExploreTtsProps) => {
  const [list, listSet] = useState<Weight[]>([]);
  const [showMasonryGrid, setShowMasonryGrid] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const weights = useListContent({
    urlUpdate: false,
    addQueries: {
      page_size: "48",
      // ...prepFilter("image", "filter_media_classes"),
    },
    fetcher: ListFeaturedWeights,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: () => {
      setShowMasonryGrid(true);
    },
    requestList: true,
    urlParam: "",
  });

  return (
    <>
      {showMasonryGrid && (
        <>
          {weights.list.length === 0 && weights.status === 3 ? (
            <div className="text-center mt-4 opacity-75">
              No weight created yet.
            </div>
          ) : (
            <div className="overflow-hidden h-100">
              <h4 className="fw-bold pt-1 pb-2">Featured Community Voices</h4>
              <div
                style={{
                  overflowX: "hidden",
                  overflowY: "auto",
                  height: "calc(100% - 50px)",
                }}
              >
                <MasonryGrid
                  gridRef={gridContainerRef}
                  onLayoutComplete={() => console.log("Layout complete!")}
                >
                  {weights.list.map((data: any, key: number) => {
                    let props = {
                      data,
                      type: "weights",
                    };

                    return (
                      <div
                        {...{
                          className:
                            "col-12 col-sm-6 col-lg-6 col-xl-4 grid-item",
                          key,
                        }}
                      >
                        <WeightsCards
                          {...{
                            type: data.weight_category,
                            props,
                            inSelectModal: true,
                            onResultSelect: onResultSelect,
                          }}
                        />
                      </div>
                    );
                  })}
                </MasonryGrid>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ExploreTts;
