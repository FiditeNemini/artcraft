import React from "react";
import "./CheckableTag.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-solid-svg-icons";

interface CheckableTagProps {
  tag: string;
  isSelected: boolean;
  onToggle: (tag: string) => void;
}

export default function CheckableTag({
  tag,
  isSelected,
  onToggle,
}: CheckableTagProps) {
  return (
    <div
      className={`d-flex align-items-center checkable-tag ${
        isSelected ? "checked" : ""
      }`}
      onClick={() => onToggle(tag)}
    >
      {tag}
      {isSelected && (
        <FontAwesomeIcon icon={faXmark} className="ms-2 remove-icon" />
      )}
    </div>
  );
}
