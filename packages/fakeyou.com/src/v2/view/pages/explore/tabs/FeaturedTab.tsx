import React, { useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import AudioCard from "components/common/Card/AudioCard";

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useBookmarks, useLazyLists } from "hooks";
import { ListFeaturedMediaFiles } from "@storyteller/components/src/api/media_files/ListFeaturedMediaFiles";
import SkeletonCard from "components/common/Card/SkeletonCard";
import ImageCard from "components/common/Card/ImageCard";
import VideoCard from "components/common/Card/VideoCard";

export default function FeaturedTab() {
  const bookmarks = useBookmarks();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [list, listSet] = useState<MediaFile[]>([]);
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);

  const media = useLazyLists({
    fetcher: ListFeaturedMediaFiles,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: () => setShowMasonryGrid(true),
    requestList: true,
    debug: "featured media",
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

        {media.isLoading && !media.list.length ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          showMasonryGrid && (
            <>
              {media.list.length === 0 && media.status === 3 ? (
                <div className="text-center mt-4 opacity-75">
                  No featured media.
                </div>
              ) : (
                <MasonryGrid
                  gridRef={gridContainerRef}
                  onLayoutComplete={() => console.log("Layout complete!")}
                >
                  {media.list.map((data: any, index: number) => {
                    let card;
                    switch (data.media_type) {
                      case "audio":
                        card = (
                          <AudioCard
                            {...{
                              bookmarks,
                              data,
                              type: "media",
                              showCreator: true,
                            }}
                          />
                        );
                        break;
                      case "image":
                        card = (
                          <ImageCard
                            {...{
                              bookmarks,
                              data,
                              type: "media",
                              showCreator: true,
                            }}
                          />
                        );
                        break;
                      case "video":
                        card = (
                          <VideoCard
                            {...{
                              bookmarks,
                              data,
                              type: "media",
                              showCreator: true,
                            }}
                          />
                        );
                        break;
                      default:
                        card = <div>Unsupported media type</div>;
                    }
                    return (
                      <div
                        key={index}
                        className="col-12 col-sm-6 col-xl-4 grid-item"
                      >
                        {card}
                      </div>
                    );
                  })}
                </MasonryGrid>
              )}
            </>
          )
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
