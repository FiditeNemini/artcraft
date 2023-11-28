import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/pro-solid-svg-icons";
import { faBookmark as faBookmarkOutline } from "@fortawesome/pro-regular-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./FavoriteButton.scss";

interface FavoriteButtonProps {
  initialToggled?: boolean;
  onToggle: (toggled: boolean) => Promise<void>;
  favoriteCount?: number;
  overlay?: boolean;
}

export default function FavoriteButton({
  initialToggled = false,
  onToggle,
  favoriteCount,
  overlay,
}: FavoriteButtonProps) {
  const [isToggled, setIsToggled] = useState(initialToggled);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onToggle(!isToggled);
      setIsToggled(!isToggled);
    } catch (error) {
      console.error("Error calling API", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = isToggled ? "favorite-button toggled" : "favorite-button";
  const buttonShadow = overlay ? "shadow" : "";
  const iconClass = isToggled ? "icon-toggled" : "icon-default";
  const toolTip = isToggled ? "Unfavorite" : "Favorite";

  return (
    <div className="d-flex gap-2" onClick={handleClick}>
      <Tippy
        theme="fakeyou"
        content={toolTip}
        hideOnClick={false}
        trigger="mouseenter"
        delay={[500, 0]}
        offset={[0, 12]}
      >
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`${buttonClass} ${buttonShadow}`}
        >
          <FontAwesomeIcon
            icon={isToggled ? faBookmark : faBookmarkOutline}
            className={`${iconClass} me-2`}
          />
          {favoriteCount && <p className="favorite-number">{favoriteCount}</p>}
        </button>
      </Tippy>
    </div>
  );
}
