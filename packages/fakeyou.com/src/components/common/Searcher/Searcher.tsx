import React, { useCallback, useRef, useState } from "react";
import Input from "../Input";
import { faSearch } from "@fortawesome/pro-solid-svg-icons";
import MasonryGrid from "../MasonryGrid/MasonryGrid";
import "./Searcher.scss";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { useBookmarks, useRatings } from "hooks";
import { SearchWeights } from "@storyteller/components/src/api/weights/SearchWeights";
import debounce from "lodash.debounce";
import WeightsCards from "../Card/WeightsCards";
import LoadingSpinner from "../LoadingSpinner";

interface SearcherProps {
  type?: "page" | "modal";
  dataType?: "media" | "weights";
  weightType?: string;
  onResultSelect?: () => void;
  weightTypeFilter?: any;
}

export default function Searcher({
  type = "page",
  dataType = "weights",
  weightType = "all",
  onResultSelect,
  weightTypeFilter,
}: SearcherProps) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [foundWeights, setFoundWeights] = useState<Weight[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(0);
  const bookmarks = useBookmarks();
  const ratings = useRatings();

  const handleInputChange = (e: any) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    debouncedDoSearch(newValue);
  };

  const doSearch = useCallback(
    async (value: string) => {
      let request: any = {
        search_term: value,
      };

      setIsSearching(true);

      if (weightType !== "all") {
        request[weightTypeFilter] = weightType;
      }

      let response = await SearchWeights(request);

      if (response.success) {
        let weights = [...response.weights];
        setFoundWeights(weights);
        setSearchCompleted(prev => prev + 1);
      } else {
        setFoundWeights([]);
      }

      setIsSearching(false);
    },
    [setFoundWeights, weightType, setSearchCompleted, weightTypeFilter]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedDoSearch = useCallback(
    debounce(searchTerm => {
      doSearch(searchTerm);
    }, 250),
    [doSearch]
  );

  return (
    <div>
      <Input
        icon={faSearch}
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        className="mb-3"
      />
      <div
        className={`searcher-container ${
          type === "modal" ? "in-modal" : ""
        }`.trim()}
      >
        {/* Result Cards */}
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <MasonryGrid
            key={searchCompleted}
            gridRef={gridContainerRef}
            onLayoutComplete={() => console.log("Layout complete!")}
          >
            {dataType === "weights" &&
              foundWeights.map((data: any, key: number) => {
                let props = {
                  data,
                  bookmarks,
                  ratings,
                  showCreator: true,
                  type: "weights",
                  inSearcher: true,
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
      </div>
    </div>
  );
}
