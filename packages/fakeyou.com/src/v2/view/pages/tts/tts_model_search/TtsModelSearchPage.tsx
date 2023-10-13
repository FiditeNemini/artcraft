import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import { faClock, faMessageDots } from "@fortawesome/pro-solid-svg-icons";
import ModelSearch from "components/common/ModelSearch";
import Panel from "components/common/Panel";
import useSearch from "hooks/useSearch/useSearch";
import ModelSearchResults from "components/common/ModelSearchResults";
import ModelTags from "components/common/ModelTags";
import Select from "components/common/Select";

interface TtsModelSearchPageProps {
  sessionWrapper: SessionWrapper;
}

const dummyData = [
  {
    id: 1,
    name: "Spongebob",
    tags: ["English", "High-pitched", "Character"],
    type: "Tacotron2",
    creator: "echelon",
    likes: 14000,
    uses: 1000000,
    comments: 250,
    time: new Date("2023-09-20T12:00:00Z").toISOString(),
  },
  {
    id: 2,
    name: "Mariano Closs",
    tags: ["Spanish", "Low-pitched"],
    type: "Tacotron2",
    creator: "echelon",
    likes: 308290,
    uses: 30000000,
    comments: 1200,
    time: new Date("2023-10-12T12:00:00Z").toISOString(),
  },
  {
    id: 3,
    name: "Cristiano  Ronaldo",
    tags: ["Portuguese", "Low-pitched"],
    type: "Tacotron2",
    creator: "echelon",
    likes: 17500,
    uses: 40000000,
    comments: 250,
    time: new Date("2023-09-20T12:00:00Z").toISOString(),
  },
  {
    id: 4,
    name: "Messi",
    tags: ["Portuguese", "Low-pitched"],
    type: "Tacotron2",
    creator: "echelon",
    likes: 17500,
    uses: 40000000,
    comments: 250,
    time: new Date("2023-09-20T12:00:00Z").toISOString(),
  },
  {
    id: 5,
    name: "Morty",
    tags: ["English", "High-pitched", "Character"],
    type: "Tacotron2",
    creator: "echelon",
    likes: 14000,
    uses: 1000000,
    comments: 250,
    time: new Date("2023-09-20T12:00:00Z").toISOString(),
  },
  {
    id: 6,
    name: "Bad Bunny",
    tags: ["Spanish", "Low-pitched"],
    type: "Tacotron2",
    creator: "echelon",
    likes: 308290,
    uses: 30000000,
    comments: 1200,
    time: new Date("2023-10-12T12:00:00Z").toISOString(),
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

        <ModelSearchResults data={filteredData} />
      </Panel>
    </Container>
  );
}
