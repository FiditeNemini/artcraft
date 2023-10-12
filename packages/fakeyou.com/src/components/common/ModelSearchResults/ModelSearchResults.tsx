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

interface ModelSearchResultsProps {
  data: any[];
}

function shortenNumber(num: number): string {
  if (Math.abs(num) < 1e3) return num.toString();
  if (Math.abs(num) < 1e6) return (num / 1e3).toFixed(1) + "k";
  if (Math.abs(num) < 1e9) return (num / 1e6).toFixed(1) + "M";
  return num.toString();
}

export default function ModelSearchResults({ data }: ModelSearchResultsProps) {
  return (
    <div className="row g-3">
      {data.map((item) => {
        return (
          <div className="col-12 col-lg-6" key={item.id}>
            <div className="model-search-results p-3">
              <h5 className="fw-semibold mb-0">{item.name}</h5>
              <p className="creator-name">
                by{" "}
                <Link className="fw-medium" to={`/profile/${item.creator}`}>
                  {item.creator}
                </Link>
              </p>
              <div className="d-flex align-items-end">
                <div className="flex-grow-1">
                  <span
                    className={`type-tag ${
                      item.type === "Tacotron2" ? "tt2" : "tt2"
                    }`}
                  >
                    {item.type}
                  </span>
                  <div className="d-flex gap-3 model-details fw-medium mt-3">
                    <div>
                      <FontAwesomeIcon icon={faHeart} className="me-2" />
                      {item.likes && shortenNumber(item.likes)}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faChartSimple} className="me-2" />
                      {item.uses && shortenNumber(item.uses)}
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faComment} className="me-2" />
                      {item.comments && shortenNumber(item.comments)}
                    </div>
                  </div>
                </div>
                <div>
                  <Button label="Use Voice" small={true} to="/" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
