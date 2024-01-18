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
import { faFilter, faLanguage, faTag } from "@fortawesome/pro-solid-svg-icons";
import Select from "components/common/Select";

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
  const languageOpts = [
    { value: "all", label: "All Languages" },
    { value: "english", label: "Egnlish" },
    { value: "spanish", label: "Spanish" },
    { value: "portuguese", label: "Portuguese" },
  ];

  const weightCategoryOpts = [
    { value: "all", label: "All Categories" },
    { value: "image_generation", label: "Image generation" },
    { value: "text_to_speech", label: "Text to speech" },
    { value: "vocoder", label: "Vocoder" },
    { value: "voice_conversion", label: "Voice conversion" },
  ];

  const weightTypeOpts = [
    { value: "all", label: "All Types" },
    { value: "hifigan_tt2", label: "HiFiGAN TT2" },
    { value: "sd_1.5", label: "SD 1.5" },
    { value: "sdxl", label: "SDXL" },
    { value: "so_vits_svc", label: "SVC" },
    { value: "rvc_v2", label: "RVC v2" },
    { value: "tt2", label: "TT2" },
    { value: "loRA", label: "LoRA" },
  ];

  return (
    <Container type="panel" className="mb-5">
      <PageHeader
        title={`${foundWeights.length || "0"} results for "${urlSearchTerm}"`}
        titleH2={true}
        // extension={tags}
        panel={false}
      />
      <Panel padding={true}>
        <div className="d-flex gap-2 mb-4">
          <Select
            {...{
              icon: faLanguage,
              options: languageOpts,
              name: "languages",
              defaultValue: languageOpts[0],
            }}
          />
          <Select
            {...{
              icon: faTag,
              options: weightCategoryOpts,
              name: "weightCategory",
              defaultValue: weightCategoryOpts[0],
            }}
          />
          <Select
            {...{
              icon: faFilter,
              options: weightTypeOpts,
              name: "weightType",
              defaultValue: weightTypeOpts[0],
            }}
          />
        </div>

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
