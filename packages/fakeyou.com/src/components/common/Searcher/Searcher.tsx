import React, { useRef } from "react";
import Input from "../Input";
import { faSearch } from "@fortawesome/pro-solid-svg-icons";
import MasonryGrid from "../MasonryGrid/MasonryGrid";
import MediaCards from "../Card/MediaCards";
import "./Searcher.scss";

interface SearcherProps {
  data?: any[];
  type?: "page" | "modal";
  dataType?: "media" | "weights";
}

export default function Searcher({
  data,
  type = "page",
  dataType = "media",
}: SearcherProps) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <Input icon={faSearch} placeholder="Search..." />
      <div
        className={`searcher-container ${
          type === "modal" ? "in-modal" : ""
        }`.trim()}
      >
        {/* Result Cards */}
        <MasonryGrid
          gridRef={gridContainerRef}
          onLayoutComplete={() => console.log("Layout complete!")}
        >
          {data &&
            dataType === "media" &&
            data.map((data: any, key: number) => {
              let props = {
                data,
                origin,
                type: "media",
                showCreator: true,
              };

              return (
                <div
                  {...{
                    className: "col-12 col-sm-6 col-xl-4 grid-item",
                    key,
                  }}
                >
                  <MediaCards {...{ type: data.media_type, props }} />
                </div>
              );
            })}

          {data &&
            dataType === "weights" &&
            data.map((data: any, key: number) => {
              let props = {
                data,
                origin,
                type: "media",
                showCreator: true,
              };

              return (
                <div
                  {...{
                    className: "col-12 col-sm-6 col-xl-4 grid-item",
                    key,
                  }}
                >
                  <MediaCards {...{ type: data.media_type, props }} />
                </div>
              );
            })}
        </MasonryGrid>
      </div>
    </div>
  );
}
