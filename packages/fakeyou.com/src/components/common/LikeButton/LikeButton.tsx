import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/pro-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/pro-regular-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./LikeButton.scss";
import useShortenNumber from "hooks/useShortenNumber";

interface LikeButtonProps {
  entityToken?: string;
  entityType?: string;
  initialToggled?: boolean;
  onToggle: (entityToken: string, entityType: string) => Promise<boolean>;
  likeCount: number;
  overlay?: boolean;
  large?: boolean;
}

export default function LikeButton({
  entityToken = "",
  entityType = "",
  initialToggled = false,
  onToggle,
  likeCount = 0, // useShortenNumber freaks out if likeCount = NaN, give it a default value until it loads
  overlay,
  large,
}: LikeButtonProps) {
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

  const buttonClass = isToggled ? "like-button toggled" : "like-button";
  const buttonShadow = overlay ? "shadow" : "";
  const iconClass = isToggled ? "icon-toggled" : "icon-default";
  const toolTip = isToggled ? "Unlike" : "Like";
  let likeCountShort = useShortenNumber(likeCount);

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
            icon={isToggled ? faHeart : faHeartOutline}
            className={`${iconClass} me-2`}
          />
          {likeCount && <p className="like-number">{likeCountShort}</p>}
        </button>
      </Tippy>
    </div>
  );
}
