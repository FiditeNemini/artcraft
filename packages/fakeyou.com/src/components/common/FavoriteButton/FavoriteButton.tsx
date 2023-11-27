import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/pro-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/pro-regular-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./FavoriteButton.scss";

interface FavoriteButtonProps {
  initialToggled?: boolean;
  onToggle: (toggled: boolean) => Promise<void>;
  FavoriteCount?: number;
}

export default function FavoriteButton({
  initialToggled = false,
  onToggle,
  FavoriteCount,
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
          className={buttonClass}
        >
          <FontAwesomeIcon
            icon={isToggled ? faHeart : faHeartOutline}
            className={`${iconClass} me-2`}
          />
          {FavoriteCount && <p className="favorite-number">{FavoriteCount}</p>}
        </button>
      </Tippy>
    </div>
  );
}
