import React from "react";
import "./ModelSearchResults.scss";

interface Props {
  data: any[];
}

export default function ModelSearchResults({ data }: Props) {
  return (
    <div className="row g-3">
      {data.map((item) => (
        <div className="col-12 col-lg-6">
          <div className="model-search-results p-3" key={item.id}>
            <h5 className="fw-semibold mb-0">{item.name}</h5>
            <p className="">by {item.creator}</p>
            <span
              className={`type-tag ${
                item.type === "Tacotron2" ? "tt2" : "tt2"
              }`}
            >
              {item.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
