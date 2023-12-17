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

interface SearchBarProps {
  autoFocus?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  isFocused?: boolean;
}

export default function SearchBar({
  autoFocus,
  onBlur,
  onFocus,
  isFocused,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [foundTtsModels, setFoundTtsModels] = useState<TtsModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const maybeSearch = useCallback(async (value: string) => {
    setSearchTerm(value);
  }, []);

  const doSearch = useCallback(
    async (value: string) => {
      let request = {
        search_term: value,
      };

      setIsLoading(true);

      let response = await SearchTtsModels(request);

      if (response.success) {
        let models = [...response.models];
        setFoundTtsModels(models);
      } else {
        setFoundTtsModels([]);
      }

      setIsLoading(false);
    },
    [setFoundTtsModels]
  );

  useEffect(() => {
    doSearch(searchTerm);
  }, [doSearch, searchTerm]);

  return (
    <div className="search-bar-container">
      <div className="search-field-group">
        <SearchField
          value={searchTerm}
          onChange={maybeSearch}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
        />
        {isFocused && (
          <SearchResultsDropdown
            data={foundTtsModels}
            isNoResults={foundTtsModels.length === 0 && searchTerm !== ""}
            isLoading={isLoading}
          />
        )}
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
