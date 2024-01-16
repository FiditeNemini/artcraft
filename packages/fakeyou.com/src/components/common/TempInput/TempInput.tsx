import React from "react";
import { Label } from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./Input.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconDefinition;
  invalidReason?: string;
  label?: string;
  textArea?: boolean;
  required?: boolean;
}

export default function TempInput({
  label,
  icon,
  invalidReason,
  textArea,
  required,
  ...rest
}: InputProps) {
  return (
    // Changed fragment to div here just so that it can be laid out with bootstrap easily using d-flex, flex-column and responsive gaps which requires grouping.
    <div className="fy-input">
      <Label {...{ invalidReason, label, required }}/>
      <div className={`fy-input ${icon ? "input-icon" : ""}`}>
        {icon && (
          <FontAwesomeIcon icon={icon} className="form-control-feedback" />
        )}
        <input className="form-control" {...rest} />
      </div>
    </div>
  );
}
