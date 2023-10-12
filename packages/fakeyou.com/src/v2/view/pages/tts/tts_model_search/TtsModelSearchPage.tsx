import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import { faMessageDots } from "@fortawesome/pro-solid-svg-icons";
import ModelSearch from "components/common/ModelSearch";
import Panel from "components/common/Panel";
import useSearch from "hooks/useSearch/useSearch";
import ModelSearchResults from "components/common/ModelSearchResults";
import ModelTags from "components/common/ModelTags";

interface TtsModelSearchPageProps {
  sessionWrapper: SessionWrapper;
}

const dummyData = [
  {
    id: 1,
    name: "Spongebob",
    tags: ["English", "High-pitched", "Character"],
    type: "Tacotron2",
  },
  {
    id: 2,
    name: "Mariano Closs",
    tags: ["Spanish", "Low-pitched"],
    type: "Tacotron2",
  },
  {
    id: 3,
    name: "Cristiano  Ronaldo",
    tags: ["Portuguese", "Low-pitched"],
    type: "Tacotron2",
  },
];

const allTags = [
  "English",
  "Spanish",
  "Portuguese",
  "High-pitched",
  "Low-pitched",
  "Character",
];

export default function TtsModelSearchPage(props: TtsModelSearchPageProps) {
  const {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    filteredData,
  } = useSearch(dummyData);

  const handleSelectTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const searchTts = (
    <div className="d-flex flex-column gap-3">
      <ModelSearch value={searchTerm} onChange={setSearchTerm} />
      <ModelTags
        tags={allTags}
        selectedTags={selectedTags}
        onSelectTag={handleSelectTag}
      />
    </div>
  );

  return (
    <Container type="panel">
      <PageHeader
        title="Text to Speech"
        titleIcon={faMessageDots}
        subText="Turn text into your favorite character's speaking voice."
        showButton={true}
        buttonLabel="Create a voice"
        buttonVariant="secondary"
        buttonTo="/voice-designer"
        extension={searchTts}
      />
      <Panel padding={true}>
        <ModelSearchResults data={filteredData} />
      </Panel>
    </Container>
  );
}
