import LoadingSpinner from "components/common/LoadingSpinner";
import React from "react";

interface ThumbnailItemProps {
  index: number;
  selectedIndex: number;
  handleThumbnailClick: (index: number) => void;
  poster?: string;
  mediaType?: string;
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  index,
  selectedIndex,
  handleThumbnailClick,
  poster,
  mediaType,
}) => {
  return (
    <div className="col-3" key={index}>
      <div
        className={`lp-thumbnail ratio ratio-1x1 ${
          index === selectedIndex ? "active" : ""
        }`}
        onClick={() => handleThumbnailClick(index)}
      >
        {/* {thumbnail ? (
          <img
            src={thumbnail}
            alt="Video Thumbnail"
            className="w-100 h-100 object-fit-cover"
            draggable="false"
          />
        ) : (
          <LoadingSpinner padding={false} />
        )} */}
        {poster ? (
          mediaType === "image" ? (
            <img
              src={poster}
              alt="Media Thumbnail"
              className="w-100 h-100 object-fit-cover"
              draggable="false"
            />
          ) : (
            <video
              src={poster}
              muted
              playsInline
              className="w-100 h-100 object-fit-cover"
              draggable="false"
            />
          )
        ) : (
          <LoadingSpinner padding={false} />
        )}
      </div>
    </div>
  );
};

export default ThumbnailItem;
