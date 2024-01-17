import React, { useCallback, useEffect, useRef, useState } from "react";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import Panel from "components/common/Panel";
// import ModelTags from "components/common/ModelTags";
import { SearchWeights } from "@storyteller/components/src/api/weights/SearchWeights";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { useLocation } from "react-router-dom";
import debounce from "lodash.debounce";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import WeightsCards from "components/common/Card/WeightsCards";
import { useBookmarks, useRatings } from "hooks";

// const allTags = [
//   "English",
//   "Spanish",
//   "Portuguese",
//   "High-pitched",
//   "Low-pitched",
//   "Character",
// ];

export default function SearchPage() {
  const [foundWeights, setFoundWeights] = useState<Weight[]>([]);
  const bookmarks = useBookmarks();
  const ratings = useRatings();

  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const doSearch = useCallback(
    async (value: string) => {
      let request = {
        search_term: value,
      };

      let response = await SearchWeights(request);

      if (response.success) {
        let weights = [...response.weights];
        setFoundWeights(weights);
      } else {
        setFoundWeights([]);
      }
    },
    [setFoundWeights]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedDoSearch = useCallback(
    debounce(searchTerm => {
      doSearch(searchTerm);
    }, 250),
    [doSearch]
  );

  const query = useQuery();
  const urlSearchTerm = query.get("query") || "";

  useEffect(() => {
    if (urlSearchTerm) {
      debouncedDoSearch(urlSearchTerm);
    }
  }, [urlSearchTerm, debouncedDoSearch]);

  // let selectedTags: any = [];
  // let handleSelectTag = () => {};

  // const tags = (
  //   <div className="d-flex flex-column gap-3">
  //     <ModelTags
  //       tags={allTags}
  //       selectedTags={selectedTags}
  //       onSelectTag={handleSelectTag}
  //     />
  //   </div>
  // );

  // const sortOptions = [
  //   { value: "most liked", label: "Most Liked" },
  //   { value: "most used", label: "Most Used" },
  //   { value: "moset recent", label: "Most Recent" },
  // ];
  // const sortTimeOptions = [
  //   { value: "all time", label: "All Time" },
  //   { value: "today", label: "Today" },
  //   { value: "this week", label: "This Week" },
  //   { value: "this month", label: "This Month" },
  // ];

  return (
    <Container type="panel" className="mb-5">
      <PageHeader
        title={`${foundWeights.length || "0"} results for "${urlSearchTerm}"`}
        titleH2={true}
        // extension={tags}
        panel={false}
      />
      <Panel padding={true}>
        {/* <div className="d-flex gap-2 mb-4">
          <Select
            small={true}
            options={sortOptions}
            defaultValue={sortOptions[0]}
          />
          <Select
            small={true}
            icon={faClock}
            options={sortTimeOptions}
            defaultValue={sortTimeOptions[0]}
          />
        </div> */}

        {/*<ModelSearchResults data={filteredData} />*/}
        {/* <ModelSearchResults data={foundWeights} /> */}

        <MasonryGrid
          gridRef={gridContainerRef}
          onLayoutComplete={() => console.log("Layout complete!")}
        >
          {foundWeights.map((data: any, key: number) => {
            let props = {
              data,
              bookmarks,
              ratings,
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
                <WeightsCards {...{ type: data.weight_category, props }} />
              </div>
            );
          })}
        </MasonryGrid>
      </Panel>
    </Container>
  );
}
