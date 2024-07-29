import React from "react";
import "./ModelSearchResults.scss";
import { Link } from "react-router-dom";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faComment,
  faHeart,
} from "@fortawesome/pro-solid-svg-icons";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";

interface Props {
  data: Weight[];
}

function shortenNumber(num: number): string {
  if (Math.abs(num) < 1e3) return num.toString();
  if (Math.abs(num) < 1e6) return (num / 1e3).toFixed(1) + "k";
  if (Math.abs(num) < 1e9) return (num / 1e6).toFixed(1) + "M";
  return num.toString();
}

export default function ModelSearchResults(props: Props) {
  // TODO: Expose fields on backend
  let likes = 1500;
  let uses = 25000;
  let comments = 25;
  let model_type = "Tacotron2";

  return (
    <div className="row g-3">
      {props.data.map(item => {
        let modelPageLink = `/weight/${item.weight_token}`;

        return (
          <div className="col-12 col-lg-6" key={item.weight_token}>
            <div className="model-search-results p-3">
              <h5 className="fw-semibold mb-0">{item.title}</h5>
              <p className="creator-name">
                by{" "}
                <Link
                  className="fw-medium"
                  to={`/profile/${item.creator.username}`}
                >
                  {item.creator.display_name}
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
                      {likes && shortenNumber(likes)}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faChartSimple} className="me-2" />
                      {uses && shortenNumber(uses)}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faComment} className="me-2" />
                      {comments && shortenNumber(comments)}
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
