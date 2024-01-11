import React, { useCallback, useEffect, useState } from "react";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import { faClock } from "@fortawesome/pro-solid-svg-icons";
import Panel from "components/common/Panel";
import ModelSearchResults from "components/common/ModelSearchResults";
import ModelTags from "components/common/ModelTags";
import Select from "components/common/Select";
import { SearchWeights } from "@storyteller/components/src/api/weights/SearchWeights";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { useLocation } from "react-router-dom";

const allTags = [
  "English",
  "Spanish",
  "Portuguese",
  "High-pitched",
  "Low-pitched",
  "Character",
];

export default function SearchPage() {
  const [foundWeights, setFoundWeights] = useState<Weight[]>([]);

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

  const query = useQuery();
  const urlSearchTerm = query.get("query") || "";

  useEffect(() => {
    if (urlSearchTerm) {
      doSearch(urlSearchTerm);
    }
  }, [urlSearchTerm, doSearch]);

  let selectedTags: any = [];
  let handleSelectTag = () => {};

  const tags = (
    <div className="d-flex flex-column gap-3">
      <ModelTags
        tags={allTags}
        selectedTags={selectedTags}
        onSelectTag={handleSelectTag}
      />
    </div>
  );

  const sortOptions = [
    { value: "most liked", label: "Most Liked" },
    { value: "most used", label: "Most Used" },
    { value: "moset recent", label: "Most Recent" },
  ];
  const sortTimeOptions = [
    { value: "all time", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "this week", label: "This Week" },
    { value: "this month", label: "This Month" },
  ];

  return (
    <Container type="panel" className="mb-5">
      <PageHeader
        title={`${foundWeights.length || "0"} results for "${urlSearchTerm}"`}
        titleH2={true}
        extension={tags}
        panel={false}
      />
      <Panel padding={true}>
        <div className="d-flex gap-2 mb-4">
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
        </div>

        {/*<ModelSearchResults data={filteredData} />*/}
        <ModelSearchResults data={foundWeights} />
      </Panel>
    </Container>
  );
}
