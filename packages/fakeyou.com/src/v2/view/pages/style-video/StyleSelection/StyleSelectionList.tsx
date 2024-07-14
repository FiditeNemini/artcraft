import React from "react";
import { StyleOption } from "common/StyleOptions";
import ModalHeader from "components/modals/ModalHeader";

interface StyleSelectionListProps {
  styleOptions: StyleOption[];
  selectedStyle: string;
  onStyleClick: (style: string, label: string, image: string) => void;
  handleClose?: any;
}

const StyleSelectionList = ({
  styleOptions,
  selectedStyle,
  onStyleClick,
  handleClose,
}: StyleSelectionListProps) => {
  return (
    <>
      <ModalHeader {...{ handleClose, title: "Choose a Style" }} />

      <div className="row g-2 style-options-list">
        {styleOptions.map(option => (
          <div
            key={option.value}
            className="col-6 col-md-4 col-lg-4 col-xl-3"
            onClick={() =>
              onStyleClick(option.value, option.label, option.image || "")
            }
          >
            <div
              className={`style-option ${
                option.value === selectedStyle ? "selected" : ""
              }`}
            >
              <img src={option.image} alt={option.label} />
              <div className="style-gradient" />
              <h6 className="style-title">{option.label}</h6>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className={`selected-style ${
                  option.value === selectedStyle ? "opacity-100" : "opacity-0"
                }`}
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
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StyleSelectionList;
