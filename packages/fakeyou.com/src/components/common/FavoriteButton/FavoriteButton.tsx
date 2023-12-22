import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/pro-solid-svg-icons";
import { faBookmark as faBookmarkOutline } from "@fortawesome/pro-regular-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./FavoriteButton.scss";
// import useShortenNumber from "hooks/useShortenNumber";

interface FavoriteButtonProps {
  entityToken?: string;
  entityType?: string;
  initialToggled?: boolean;
  onToggle: (entityToken: string, entityType: string) => Promise<boolean>;
  favoriteCount?: number;
  overlay?: boolean;
  large?: boolean;
}

export default function FavoriteButton({
  entityToken = "",
  entityType = "",
  initialToggled = false,
  onToggle,
  favoriteCount,
  overlay,
  large,
}: FavoriteButtonProps) {
  const [isToggled, setIsToggled] = useState(initialToggled);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    onToggle(entityToken, entityType)
    .then((isToggled: boolean) => {
      setIsToggled(isToggled);
      setIsLoading(false);
    });
    // try {
    //   await onToggle(!isToggled);
    //   setIsToggled(!isToggled);
    // } catch (error) {
    //   console.error("Error calling API", error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const buttonClass = isToggled ? "favorite-button toggled" : "favorite-button";
  const buttonShadow = overlay ? "shadow" : "";
  const iconClass = isToggled ? "icon-toggled" : "icon-default";
  const toolTip = isToggled ? "Unbookmark" : "Bookmark";
  // let favoriteCountShort = useShortenNumber(favoriteCount || 0);

  return (
    <div className="d-flex gap-2" onClick={handleClick}>
      <Tippy
        theme="fakeyou"
        content={toolTip}
        hideOnClick={false}
        trigger="mouseenter"
        delay={[500, 0]}
        offset={[0, 12]}
        placement="bottom"
      >
        <button
          // onClick={handleClick} // unnecessary, parent has onClick, runs twice 
          disabled={isLoading}
          className={`${buttonClass} ${buttonShadow} ${large ? "large" : ""}`}
        >
          <FontAwesomeIcon
            icon={isToggled ? faBookmark : faBookmarkOutline}
            className={`${iconClass} me-2`}
          />
          <p className="favorite-text">{isToggled ? "Saved" : "Save"}</p>
        </button>
      </Tippy>
    </div>
  );
}
