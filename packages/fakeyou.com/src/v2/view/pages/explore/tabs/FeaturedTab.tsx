import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";
import SkeletonCard from "components/common/Card/SkeletonCard";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useLazyLists } from "hooks";
import { ListFeaturedMediaFiles } from "@storyteller/components/src/api/media_files/ListFeaturedMediaFiles";

export default function FeaturedTab() {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading] = useState(false);
  const [list, listSet] = useState<MediaFile[]>([]);

  const media = useLazyLists({
    fetcher: ListFeaturedMediaFiles,
    list,
    listSet,
    requestList: true,
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <div className="d-flex align-items-center mb-3">
          <h3 className="fw-semibold mb-0 flex-grow-1">Featured Media</h3>
          <Link to="/explore/media">
            View media
            <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
          </Link>
        </div>

        {isLoading ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <MasonryGrid
            gridRef={gridContainerRef}
            onLayoutComplete={() => console.log("Layout complete!")}
          >
            {media.list.map((data, index) => {
              let card = (
                <AudioCard
                  key={index}
                  data={data}
                  type="media"
                  showCreator={true}
                  showCover={true}
                />
              );
              return (
                <div
                  key={index}
                  className="col-12 col-lg-6 col-xxl-4 grid-item"
                >
                  {card}
                </div>
              );
            })}
          </MasonryGrid>
        )}
      </div>
      {/* <div>
        <div className="d-flex align-items-center mb-3">
          <h3 className="fw-semibold mb-0 flex-grow-1">
            Featured Image Weights
          </h3>
          <Link to="/explore/weights">
            View all
            <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
          </Link>
        </div>

        {isLoading ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <MasonryGrid
            gridRef={gridContainerRef}
            onLayoutComplete={() => console.log("Layout complete!")}
          >
            {data.map((data, index) => {
              let card = (
                <ImageCard
                  key={index}
                  data={data}
                  type="weights"
                  showCreator={true}
                />
              );
              return (
                <div key={index} className="col-12 col-sm-6 col-xl-4 grid-item">
                  {card}
                </div>
              );
            })}
          </MasonryGrid>
        )}
      </div> */}
    </div>
  );
}
