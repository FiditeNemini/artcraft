import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/pro-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/pro-regular-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./LikeButton.scss";

interface LikeButtonProps {
  initialToggled?: boolean;
  onToggle: (toggled: boolean) => Promise<void>;
  likeCount?: number;
  overlay?: boolean;
}

export default function LikeButton({
  initialToggled = false,
  onToggle,
  likeCount,
  overlay,
}: LikeButtonProps) {
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

  const buttonClass = isToggled ? "like-button toggled" : "like-button";
  const buttonShadow = overlay ? "shadow" : "";
  const iconClass = isToggled ? "icon-toggled" : "icon-default";
  const toolTip = isToggled ? "Unlike" : "Like";

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
          onClick={handleClick}
          disabled={isLoading}
          className={`${buttonClass} ${buttonShadow}`}
        >
          <FontAwesomeIcon
            icon={isToggled ? faHeart : faHeartOutline}
            className={`${iconClass} me-2`}
          />
          {likeCount && <p className="like-number">{likeCount}</p>}
        </button>
      </Tippy>
    </div>
  );
}
