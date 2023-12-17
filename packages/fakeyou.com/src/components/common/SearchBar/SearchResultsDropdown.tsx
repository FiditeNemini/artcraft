import { TtsModel } from "@storyteller/components/src/api/tts/SearchTtsModels";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import Badge from "../Badge";

interface SearchResultsDropdownProps {
  data: TtsModel[];
  isNoResults?: boolean;
  isLoading?: boolean;
}

export default function SearchResultsDropdown({
  data,
  isNoResults,
  isLoading,
}: SearchResultsDropdownProps) {
  const history = useHistory();

  const handleResultClick = (item: TtsModel, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    history.push(`/weights/${item.model_token}`);
  };

  const handleInnerClick = (event: any) => {
    event.stopPropagation();
  };

  return (
    <>
      {data.length !== 0 && (
        <div className="search-results-dropdown">
          {data.map(item => {
            // let modelPageLink = `/weight/${item.model_token}`;

            return (
              <div
                className="search-results-dropdown-item p-3"
                key={item.model_token}
                onClick={event => handleResultClick(item, event)}
              >
                <h6 className="fw-semibold mb-1">{item.title}</h6>
                <div className="d-flex gap-2 align-items-center">
                  <p className="fs-7">
                    by{" "}
                    <Link
                      className="fw-medium"
                      to={`/profile/${item.creator_username}`}
                      onClick={handleInnerClick}
                    >
                      {item.creator_display_name}
                    </Link>
                  </p>
                  <Badge label={"TTS"} color={"ultramarine"} small={true} />
                </div>
              </div>
            );
          })}
          <div className="search-results-dropdown-item view-more p-3">
            View more results
          </div>
        </div>
      )}
      {data.length === 0 && !isLoading && isNoResults && (
        <div className="search-results-dropdown">
          <div
            className="search-results-dropdown-item p-3 no-results"
            onClick={handleInnerClick}
          >
            No results found
          </div>
        </div>
      )}
      {isLoading && isNoResults && (
        <div className="search-results-dropdown">
          <div
            className="search-results-dropdown-item p-3"
            onClick={handleInnerClick}
          >
            <div className="text-center">
              <div
                className="spinner-border spinner-border-md opacity-50"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
