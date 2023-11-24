// import { Panel } from "components/common";
import React, { useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockData from "./mockData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
// import InfiniteScroll from "react-infinite-scroll-component";
import Panel from "components/common/Panel";
import { Select } from "components/common/Inputs/Inputs";
import { faFilter } from "@fortawesome/pro-solid-svg-icons";

export default function MediaTab() {
  const [data, setData] = useState(mockData);
  // const [hasMore, setHasMore] = useState(true);

  // const fetchData = () => {
  //   setTimeout(() => {
  //     setData((prevData) => [...prevData, ...mockData]);
  //     setHasMore(false);
  //   }, 1500);
  // };

  const options = [
    { value: "all", label: "All Media" },
    { value: "images", label: "Images" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
  ];

  return (
    <Panel clear={true} padding={true}>
      <div className="d-flex mb-3">
        <Select
          icon={faFilter}
          options={options}
          defaultValue={options[0]}
          isSearchable={false}
        />
      </div>

      <MasonryGrid>
        {data.map((data, index) => {
          let card;
          switch (data.media_type) {
            case "audio":
              card = <AudioCard key={index} data={data} to="/" />;
              break;
            case "image":
              card = <ImageCard key={index} data={data} to="/" />;
              break;
            case "video":
              card = <>test</>;
              break;
            default:
              card = <div key={index}>Unsupported media type</div>;
          }
          return (
            <div
              key={index}
              className="col-12 col-sm-6 col-xl-4 col-xxl-3 grid-item"
            >
              {card}
            </div>
          );
        })}
      </MasonryGrid>
    </Panel>
  );
}
