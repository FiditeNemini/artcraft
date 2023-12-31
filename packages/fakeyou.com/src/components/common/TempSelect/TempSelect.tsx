import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "../Select/Select.scss";
import ReactSelect, { Props as ReactSelectProps } from "react-select";
import "./Select.scss";

export interface Option {
  value: string | number | boolean;
  label: string;
}

export interface SelectProps extends ReactSelectProps {
  icon?: IconDefinition;
  label?: string;
  rounded?: boolean;
  small?: boolean;
  options: Option[];
  onChange?: (value: any) => void;
  required?: boolean;
}

export default function Select({
  label,
  icon,
  name,
  onChange: inChange = () => {},
  options = [],
  rounded,
  small,
  value,
  required,
  ...rest
}: SelectProps) {
  const valueLabel =
    options.find((option: any) => option.value === value)?.label || "";
  const onChange = ({ value }: any) =>
    inChange({ target: { value, name, type: "select" } });
  const className = `fy-select ${icon ? " input-icon" : ""}${
    small ? " select-small" : ""
  }`;
  const classNames = {
    control: ({ isFocused }: { isFocused: boolean }) =>
      `select${icon ? " with-icon" : ""}${rounded ? " rounded-full" : ""}${
        isFocused ? " focused" : ""
      }`,
    option: () => "select-option",
    input: () => "select-input",
    placeholder: () => "select-placeholder",
    singleValue: () => "select-value",
    menu: () => "select-container",
    indicatorSeparator: () => "select-separator",
  };

  return (
    <>
      {label && (
        <label className={`sub-title ${required ? "required" : ""}`}>
          {label}
        </label>
      )}
      <div {...{ className }}>
        {icon && (
          <FontAwesomeIcon icon={icon} className="form-control-feedback" />
        )}
        <div className="w-100">
          <ReactSelect
            {...{
              classNamePrefix: "select",
              classNames,
              name,
              onChange,
              options,
              value: { label: valueLabel, value },
              ...rest,
            }}
          />
        </div>
      </div>
    </>
  );
}
