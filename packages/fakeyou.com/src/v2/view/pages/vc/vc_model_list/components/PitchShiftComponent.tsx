import React from "react";
import { Range } from "react-range";
import Select from "react-select";
import Tippy from "@tippyjs/react";

interface PitchShiftProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

const dropdownFieldClass = {
  control: (state: any) =>
    state.isFocused
      ? "select-search no-padding focused rounded"
      : "select-search no-padding rounded",
  option: (state: any) => (state.isFocused ? "select-option" : "select-option"),
  input: (state: any) => (state.isFocused ? "select-input" : "select-input"),
  placeholder: (state: any) =>
    state.isFocused ? "select-placeholder" : "select-placeholder",
  singleValue: (state: any) =>
    state.isFocused ? "select-value" : "select-value",
  menu: (state: any) =>
    state.isFocused ? "select-container" : "select-container",
  indicatorSeparator: (state: any) =>
    state.isFocused ? "select-separator" : "select-separator",
};

const options = ["CREPE", "Harvest", "DIO"];

function PitchShiftComponent({
  min,
  max,
  step,
  value,
  onChange,
}: PitchShiftProps) {
  const handleChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const renderTrack = ({ props, children }: any) => (
    <div
      {...props}
      style={{
        ...props.style,
        height: "8px",
        width: "100%",
        backgroundColor: "#3c3c50",
        borderRadius: "4px",
      }}
    >
      {children}
    </div>
  );

  const renderThumb = ({ props, isDragged, isHovered }: any) => (
    <Tippy
      content="Semitones"
      placement="bottom"
      theme="range-slider"
      arrow={false}
    >
      <div
        {...props}
        style={{
          ...props.style,
          height: "22px",
          width: "22px",
          borderRadius: "50%",
          backgroundColor: isHovered ? "#fff" : "#e66462",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          outline: "none",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.15)", // Add soft shadow on hover
        }}
      ></div>
    </Tippy>
  );

  return (
    <>
      <div>
        <Select
          value={options[0]} // Controlled components use "value" instead of "defaultValue".
          options={options}
          classNames={dropdownFieldClass}
          placeholder={options[0]}
          isSearchable={false}
        />
      </div>
      <div className="d-flex gap-3 align-items-center">
        <div className="flex-grow-1">
          <Range
            step={step}
            min={min}
            max={max}
            values={[value]} // Changed from `values` to `[value]`
            onChange={handleChange}
            renderTrack={renderTrack}
            renderThumb={renderThumb}
          />
        </div>
        <input
          className="form-control range-slider-value"
          value={value.toFixed(0)}
          disabled
        ></input>
      </div>
    </>
  );
}

export default PitchShiftComponent;
