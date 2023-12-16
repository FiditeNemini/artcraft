import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TtsModel } from "@storyteller/components/src/api/tts/SearchTtsModels";
import React from "react";
import { Link } from "react-router-dom";
import Button from "../Button";
import {
  faChartSimple,
  faComment,
  faHeart,
} from "@fortawesome/pro-solid-svg-icons";

interface SearchResultsDropdownProps {
  data: TtsModel[];
}

export default function SearchResultsDropdown({
  data,
}: SearchResultsDropdownProps) {
  let likes = 1500;
  let uses = 25000;
  let comments = 25;
  let model_type = "Tacotron2";

  return (
    <div className="row g-3">
      {data.map(item => {
        let modelPageLink = `/tts/${item.model_token}`;

        return (
          <div className="col-12 col-lg-6" key={item.model_token}>
            <div className="model-search-results p-3">
              <h5 className="fw-semibold mb-0">{item.title}</h5>
              <p className="creator-name">
                by{" "}
                <Link
                  className="fw-medium"
                  to={`/profile/${item.creator_username}`}
                >
                  {item.creator_display_name}
                </Link>
              </p>
              <div className="d-flex align-items-end">
                <div className="flex-grow-1">
                  <span
                    className={`type-tag ${
                      model_type === "Tacotron2" ? "tt2" : "tt2" // TODO
                    }`}
                  >
                    TT2
                  </span>
                  <div className="d-flex gap-3 model-details fw-medium mt-3">
                    <div>
                      <FontAwesomeIcon icon={faHeart} className="me-2" />
                      {likes && likes}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faChartSimple} className="me-2" />
                      {uses && uses}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faComment} className="me-2" />
                      {comments && comments}
                    </div>
                  </div>
                </div>
                <div>
                  <Button label="Use Voice" small={true} to={modelPageLink} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
