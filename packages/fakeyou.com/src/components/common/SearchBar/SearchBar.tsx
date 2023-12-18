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
import { useHistory, useLocation } from "react-router-dom";
import { useSearch } from "context/SearchContext";

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
  let history = useHistory();
  let location = useLocation();

  const { searchTerm, setSearchTerm } = useSearch();
  const [foundTtsModels, setFoundTtsModels] = useState<TtsModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isOnSearchPage = location.pathname.startsWith("/search");

  const maybeSearch = useCallback(
    async (value: string) => {
      setSearchTerm(value);
    },
    [setSearchTerm]
  );

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
    if (isOnSearchPage) {
      const query = new URLSearchParams(location.search).get("query");
      if (query) {
        setSearchTerm(query);
      }
    }
  }, [isOnSearchPage, location.search, setSearchTerm]);

  useEffect(() => {
    if (isOnSearchPage) {
      history.push(`/search/weights?query=${encodeURIComponent(searchTerm)}`);
    } else {
      doSearch(searchTerm);
    }
  }, [searchTerm, history, location.pathname, doSearch, isOnSearchPage]);

  const handleSearchButtonClick = useCallback(() => {
    history.push(`/search/weights?query=${encodeURIComponent(searchTerm)}`);
  }, [searchTerm, history]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearchButtonClick();
      }
    },
    [handleSearchButtonClick]
  );

  return (
    <div className="search-bar-container">
      <div className="search-field-group">
        <SearchField
          value={searchTerm}
          onChange={maybeSearch}
          onKeyPress={handleKeyPress}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
        />
        {isFocused && !isOnSearchPage && (
          <SearchResultsDropdown
            data={foundTtsModels}
            isNoResults={foundTtsModels.length === 0 && searchTerm !== ""}
            isLoading={isLoading}
            searchTerm={searchTerm}
          />
        )}
      </div>

      <Button
        icon={faSearch}
        onClick={handleSearchButtonClick}
        variant="secondary"
        className="search-bar-button d-none d-lg-flex"
      />
    </div>
  );
}
