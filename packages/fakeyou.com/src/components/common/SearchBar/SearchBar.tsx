import React, { useCallback, useEffect, useState } from "react";
import Button from "../Button";
import { faSearch } from "@fortawesome/pro-solid-svg-icons";
import {
  SearchTtsModels,
  TtsModel,
} from "@storyteller/components/src/api/tts/SearchTtsModels";
import SearchResultsDropdown from "./SearchResultsDropdown";
import SearchField from "./SearchField";
import "./SearchBar.scss";

interface SearchBarProps {}

export default function SearchBar(props: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [foundTtsModels, setFoundTtsModels] = useState<TtsModel[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const maybeSearch = useCallback(async (value: string) => {
    setSearchTerm(value);
  }, []);

  const doSearch = useCallback(
    async (value: string) => {
      let request = {
        search_term: value,
      };

      let response = await SearchTtsModels(request);

      if (response.success) {
        let models = [...response.models];
        setFoundTtsModels(models);
      } else {
        setFoundTtsModels([]);
      }
    },
    [setFoundTtsModels]
  );

  useEffect(() => {
    doSearch(searchTerm);
  }, [doSearch, searchTerm]);

  const onBlurHandler = () => {
    // Search field blur/Unfocusing hack: needs a little bit of delay for the result click event to register
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-group">
        <SearchField
          value={searchTerm}
          onChange={maybeSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={onBlurHandler}
        />
        {isFocused && <SearchResultsDropdown data={foundTtsModels} />}
      </div>

      <Button
        icon={faSearch}
        onClick={() => {}}
        variant="secondary"
        className="search-bar-button d-none d-lg-flex"
      />
    </div>
  );
}
