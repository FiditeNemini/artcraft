// import { Panel } from "components/common";
import React, { useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import mockData from "./mockData";
import AudioCard from "components/common/Card/AudioCard";
import ImageCard from "components/common/Card/ImageCard";
import InfiniteScroll from "react-infinite-scroll-component";
import Panel from "components/common/Panel";

export default function MediaTab() {
  const [data, setData] = useState(mockData); // State to hold your data
  const [hasMore, setHasMore] = useState(true);

  const fetchData = () => {
    setTimeout(() => {
      setData((prevData) => [...prevData, ...mockData]);
      setHasMore(false);
    }, 1500);
  };

  return (
    <Panel clear={true} padding={true}>
      <InfiniteScroll
        dataLength={data.length}
        next={fetchData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        className="overflow-hidden"
      >
        <MasonryGrid>
          {data.map((data, index) => {
            let card;
            switch (data.media_type) {
              case "audio":
                card = <AudioCard key={index} data={data} />;
                break;
              case "image":
                card = <ImageCard key={index} data={data} />;
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
                className="col-12 col-sm-6 col-lg-4 col-xl-3 grid-item"
              >
                {card}
              </div>
            );
          })}
        </MasonryGrid>
      </InfiniteScroll>
    </Panel>
  );
}
