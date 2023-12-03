import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconDefinition;
  label?: string;
  textArea?: boolean;
}

export default function TempInput({
  label,
  icon,
  textArea,
  ...rest
}: InputProps) {
  return (
    <>
      {label && <label className="sub-title">{label}</label>}
      <div className={`form-group ${icon ? "input-icon" : ""}`}>
        {icon && (
          <FontAwesomeIcon icon={icon} className="form-control-feedback" />
        )}
        <input className="form-control" {...rest} />
      </div>
    </>
  );
}
