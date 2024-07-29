import React from "react";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useStyleStore from "hooks/useStyleStore";
import "./StyleSelection.scss";
import { Label } from "components/common";

interface StyleSelectionButtonProps {
  onClick: () => void;
  imageSrc?: string;
  className?: string;
}

export function StyleSelectionButton({
  onClick,
  className,
}: StyleSelectionButtonProps) {
  const { currentImage, selectedStyleLabel } = useStyleStore();

  return (
    <div className={`fy-style-selection-button ${className}`.trim()}>
      <Label label="Choose a Style" />
      <button className="button" onClick={onClick}>
        <div className="image-container">
          <img src={currentImage} alt={selectedStyleLabel} />
        </div>
        <div className="flex-grow-1">
          <h6 className="mb-0">{selectedStyleLabel}</h6>
        </div>
        <FontAwesomeIcon icon={faChevronRight} className="fs-5 opacity-50" />
      </button>
    </div>
  );
}
