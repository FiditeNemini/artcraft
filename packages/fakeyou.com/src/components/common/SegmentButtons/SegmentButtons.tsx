import React from "react";
import { Label } from "components/common";
import "./SegmentButtons.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, fa0 } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  label?: string;
  subLabel?: string;
  name?: string;
  onChange?: any;
  options?: any;
  value?: string | number;
  icon?: IconDefinition | undefined;
  disabled?: boolean;
  highlight?: boolean;
}

export default function SegmentButtons({
  label,
  subLabel,
  name,
  icon,
  onChange,
  options = [],
  value: inValue = "",
  disabled = false,
  highlight = false,
}: Props) {
  // const onClick = ({ target }: any) => onChange();
  return (
    <div>
      {label && <Label {...{ label, disabled: disabled }} />}
      <ul {...{ className: "fy-segment-buttons mb-0" }}>
        {options.map(
          (
            { label = "", value = "", icon = fa0, subLabel = "" },
            key: number
          ) => (
            <li
              {...{
                className: `${
                  value === inValue
                    ? `fy-selected-segment ${
                        highlight && "fy-highlighted-segment"
                      }`.trim()
                    : ""
                } ${disabled ? "fy-disabled-segment" : ""}`.trim(),
                key,
                onClick: ({ target }: any) =>
                  onChange({ target: { name, type: "option", value } }),
              }}
            >
              {icon === fa0 ? null : (
                <FontAwesomeIcon
                  icon={icon}
                  className="fy-segment-button-icon"
                />
              )}
              {label}
              {subLabel && <p>{subLabel}</p>}
            </li>
          )
        )}
      </ul>
    </div>
  );
}
