import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import { faClock, faMessageDots } from "@fortawesome/pro-solid-svg-icons";
import ModelSearch from "components/common/ModelSearch";
import Panel from "components/common/Panel";
import ModelSearchResults from "components/common/ModelSearchResults";
import ModelTags from "components/common/ModelTags";
import Select from "components/common/Select";
import { SearchTtsModels, TtsModel } from "@storyteller/components/src/api/tts/SearchTtsModels";

interface TtsModelSearchPageProps {
  sessionWrapper: SessionWrapper;
}

const allTags = [
  "English",
  "Spanish",
  "Portuguese",
  "High-pitched",
  "Low-pitched",
  "Character",
];

export default function TtsModelSearchPage(props: TtsModelSearchPageProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [foundTtsModels, setFoundTtsModels] = useState<TtsModel[]>([]);

  let selectedTags : any = [];
  let handleSelectTag = () => {};

  const maybeSearch = useCallback(async (
    value: string
  ) => {
    setSearchTerm(value);
  }, []);


  const doSearch = useCallback(async (
    value: string
  ) => {
    let request = {
      search_term: value,
    }

    let response = await SearchTtsModels(request);

    if (response.success) {
      let models = [...response.models];
      setFoundTtsModels(models);
    } else {
      setFoundTtsModels([]);
    }
  }, [setFoundTtsModels]);

  useEffect(() => {
    doSearch(searchTerm);
  }, [doSearch, searchTerm])

  const searchTts = (
    <div className="d-flex flex-column gap-3">
      <ModelSearch value={searchTerm} onChange={maybeSearch} />
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
    <Container type="panel">
      <PageHeader
        title="Text to Speech"
        titleIcon={faMessageDots}
        subText="Turn text into your favorite character's voice."
        showButton={true}
        buttonLabel="Create a voice"
        buttonVariant="secondary"
        buttonTo="/voice-designer"
        extension={searchTts}
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
        <ModelSearchResults data={foundTtsModels} />
      </Panel>
    </Container>
  );
}
