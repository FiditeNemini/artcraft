import { ListWeights, Weight } from "@storyteller/components/src/api";
import { useLazyLists } from "hooks";
import React, { useRef, useState } from "react";
import prepFilter from "resources/prepFilter";
import { MasonryGrid, WeightsCards } from "components/common";

interface ExploreTtsProps {
  onResultSelect?: (data: any) => void;
}

const ExploreTts = ({ onResultSelect }: ExploreTtsProps) => {
  const [list, listSet] = useState<Weight[]>([]);
  const [showMasonryGrid, setShowMasonryGrid] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const weights = useLazyLists({
    addQueries: {
      page_size: "48",
      ...prepFilter("text_to_speech", "weight_category"),
    },
    fetcher: ListWeights,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: res => {
      setShowMasonryGrid(true);
    },
    requestList: true,
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
            <>
              <h4 className="fw-bold">Newest Community Voices</h4>
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
            </>
          )}
        </>
      )}
    </>
  );
};

export default ExploreTts;
