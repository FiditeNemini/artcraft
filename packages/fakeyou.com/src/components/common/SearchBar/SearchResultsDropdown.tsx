import { TtsModel } from "@storyteller/components/src/api/tts/SearchTtsModels";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import Badge from "../Badge";

interface SearchResultsDropdownProps {
  data: TtsModel[];
}

export default function SearchResultsDropdown({
  data,
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
    </>
  );
}
