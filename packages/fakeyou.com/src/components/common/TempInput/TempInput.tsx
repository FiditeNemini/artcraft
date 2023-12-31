import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./Input.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconDefinition;
  label?: string;
  textArea?: boolean;
  required?: boolean;
}

export default function TempInput({
  label,
  icon,
  textArea,
  required,
  ...rest
}: InputProps) {
  return (
    <>
      {label && (
        <label className={`sub-title ${required ? "required" : ""}`}>
          {label}
        </label>
      )}
      <div className={`${icon ? "input-icon" : ""}`}>
        {icon && (
          <FontAwesomeIcon icon={icon} className="form-control-feedback" />
        )}
        <input className="form-control" {...rest} />
      </div>
    </>
  );
}
