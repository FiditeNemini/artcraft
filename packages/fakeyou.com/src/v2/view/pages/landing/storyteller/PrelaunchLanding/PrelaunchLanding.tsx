import React, { useEffect, useState } from "react";
import "./PrelaunchLanding.scss";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { MainButton } from "./MainButton";

interface MediaItem {
  token: string;
  public_bucket_path: string;
  maybe_creator: {
    username: string;
  };
}

interface Props {
  sessionWrapper: SessionWrapper;
}

function PrelaunchLanding(props: Props) {
  const totalGrids = 63;
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [blankGrids, setBlankGrids] = useState<number[]>([15, 16, 17, 22, 23]);
  const [screenSize, setScreenSize] = useState("lg");

  useEffect(() => {
    fetchMediaItems();
    updateGridsForScreenSize();
    window.addEventListener("resize", updateGridsForScreenSize);
    return () => window.removeEventListener("resize", updateGridsForScreenSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateGridsForScreenSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      setBlankGrids([7, 8, 9, 10, 11, 12]);
      setScreenSize("sm");
    } else if (screenWidth < 992) {
      setBlankGrids([12, 13, 14, 17, 18, 19]);
      setScreenSize("md");
    } else {
      setBlankGrids([15, 16, 17, 22, 23]);
      setScreenSize("lg");
    }
  };

  const getCustomGridItemIndex = () => {
    switch (screenSize) {
      case "lg":
        return 15;
      case "md":
        return 12;
      case "sm":
        return 7;
      default:
        return 15;
    }
  };

  const fetchMediaItems = async () => {
    try {
      const response = await fetch(
        "https://api.storyteller.ai/v1/media_files/list_featured?page_size=1000&filter_media_classes=video"
      );
      const data = await response.json();
      if (data.success) {
        setMediaItems(shuffleArray(data.results));
      }
    } catch (error) {
      console.error("Error fetching media items:", error);
    }
  };

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const renderGridItems = () => {
    const gridItems = [];
    const customGridItemIndex = getCustomGridItemIndex();

    for (let i = 1; i <= totalGrids; i++) {
      const isBlank = blankGrids.includes(i);
      if (screenSize === "sm") {
        if (i === 10) {
          gridItems.push(
            <div
              key="10-12"
              className={`prelaunch-grid-item triple-grid prelaunch-grid-item-custom ${
                isBlank ? "blank" : ""
              }`}
            >
              <MainButton sessionWrapper={props.sessionWrapper} />
            </div>
          );
          i += 2;
          continue;
        }
      } else if (screenSize === "md") {
        if (i === 17) {
          gridItems.push(
            <div
              key="17-19"
              className={`prelaunch-grid-item triple-grid prelaunch-grid-item-custom ${
                isBlank ? "blank" : ""
              }`}
            >
              <MainButton sessionWrapper={props.sessionWrapper} />
            </div>
          );
          i += 2;
          continue;
        }
      } else {
        if (i === 22) {
          gridItems.push(
            <div
              key="22-23"
              className={`prelaunch-grid-item double-grid prelaunch-grid-item-custom ${
                isBlank ? "blank" : ""
              }`}
            >
              <MainButton sessionWrapper={props.sessionWrapper} />
            </div>
          );
          i++;
          continue;
        }
      }

      const mediaItem = mediaItems[i - 1];
      const bucketConfig = new BucketConfig();
      const gifUrl = mediaItem
        ? bucketConfig.getCdnUrl(
            mediaItem.public_bucket_path + "-thumb.gif",
            360,
            20
          )
        : "";

      gridItems.push(
        <div
          key={i}
          className={`prelaunch-grid-item ${isBlank ? "blank" : ""} ${
            i === customGridItemIndex ? "prelaunch-grid-item-custom" : ""
          }`.trim()}
        >
          {isBlank ? (
            i === customGridItemIndex ? (
              <img
                className="logo"
                src="/fakeyou/Storyteller-Logo-1.png"
                alt="Storyteller Logo"
              />
            ) : null
          ) : mediaItem ? (
            <img
              onClick={() =>
                window.location.href = `/media/${mediaItem.token}`
              }
              src={gifUrl}
              className="w-100 h-100 object-fit-cover"
              alt={`Video by ${mediaItem.maybe_creator.username}`}
            />
          ) : null}
        </div>
      );
    }
    return gridItems;
  };

  return <div className="prelaunch-grid-container">{renderGridItems()}</div>;
};

export default PrelaunchLanding;
