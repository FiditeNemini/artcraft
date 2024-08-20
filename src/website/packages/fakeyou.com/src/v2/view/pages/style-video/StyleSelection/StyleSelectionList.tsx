import React from "react";
import { StyleOption } from "common/StyleOptions";

interface StyleSelectionListProps {
  styleOptions: StyleOption[];
  selectedStyles: string[];
  onStyleClick: (styles: string[], labels: string[], images: string[]) => void;
  handleClose?: any;
}

const MAX_STYLES = 3;

const StyleSelectionList = ({
  styleOptions,
  selectedStyles,
  onStyleClick,
  handleClose,
}: StyleSelectionListProps) => {
  const handleStyleSelection = (style: StyleOption) => {
    let updatedStyles = [...selectedStyles];
    let updatedLabels: string[] = [];
    let updatedImages: string[] = [];

    if (updatedStyles.includes(style.value)) {
      updatedStyles = updatedStyles.filter(s => s !== style.value);
    } else {
      if (updatedStyles.length >= MAX_STYLES) {
        updatedStyles.shift();
      }
      updatedStyles.push(style.value);
    }

    updatedLabels = updatedStyles.map(
      s => styleOptions.find(option => option.value === s)?.label || ""
    );
    updatedImages = updatedStyles.map(
      s => styleOptions.find(option => option.value === s)?.image || ""
    );

    onStyleClick(updatedStyles, updatedLabels, updatedImages);
  };

  return (
    <div className="row g-2 style-options-list">
      {styleOptions.map(option => (
        <div
          key={option.value}
          className="col-6 col-md-4 col-lg-4 col-xl-3"
          onClick={() => handleStyleSelection(option)}
        >
          <div
            className={`style-option ${
              selectedStyles.includes(option.value) ? "selected" : ""
            }`}
          >
            <img src={option.image} alt={option.label} />
            <div
              className={`style-gradient ${
                selectedStyles.includes(option.value) ? "selected" : ""
              }`}
            />
            <h6 className="style-title">{option.label}</h6>
            {selectedStyles.includes(option.value) && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="selected-style opacity-100"
              >
                <path
                  opacity="1"
                  d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c-9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                  fill="#FC6B68"
                />
                <path
                  d="M369 175c-9.4 9.4-9.4 24.6 0 33.9L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c-9.4-9.4 24.6-9.4 33.9 0z"
                  fill="#FFFFFF"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StyleSelectionList;
