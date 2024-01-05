import React, { useEffect, useRef, useState } from "react";
import MasonryGrid from "components/common/MasonryGrid/MasonryGrid";
import MediaCards from "components/common/Card/MediaCards";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useBookmarks, useRatings } from "hooks";
import { ListFeaturedMediaFiles } from "@storyteller/components/src/api/media_files/ListFeaturedMediaFiles";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import SkeletonCard from "components/common/Card/SkeletonCard";

export default function FeaturedTab() {
  const bookmarks = useBookmarks();
  const ratings = useRatings();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [list, listSet] = useState<MediaFile[]>([]);
  // const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [status, statusSet] = useState(FetchStatus.ready);
  const isLoading = status === FetchStatus.ready || status === FetchStatus.in_progress;

  useEffect(() => {
    if (status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      ListFeaturedMediaFiles("",{}).then((res: any) => {
        console.log("🏮",res);
        statusSet(FetchStatus.success);
        if (res.results) {
          listSet(res.results);
        }
      });
    }
  },[status]);

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

        { isLoading && !list.length ? (
          <div className="row gx-3 gy-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : ( <>
              { list.length === 0 && status === 3 ? (
                <div className="text-center mt-4 opacity-75">
                  No featured media.
                </div>
              ) : (
                <MasonryGrid
                  gridRef={gridContainerRef}
                  onLayoutComplete={() => console.log("Layout complete!")}
                >
                  { list.map((data: any, key: number) => {
                    let props = { bookmarks, data, origin, ratings, type: "media" };

                    return <div {...{
                      className: "col-12 col-sm-6 col-xl-4 grid-item",
                      key
                    }}>
                      <MediaCards {...{ type: data.media_type, props }} />
                    </div>;
                  }) }
                </MasonryGrid>
              )}
            </>
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
