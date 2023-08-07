import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface InputProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  icon?: IconDefinition;
  label?: string;
  placeholder?: string;
  type?: string;
}

export default function Input(props: InputProps) {
  return (
    <div>
      {props.label && <label className="sub-title">{props.label}</label>}

      <div className={`form-group ${props.icon ? "input-icon" : ""}`}>
        {props.icon && (
          <FontAwesomeIcon
            icon={props.icon}
            className="form-control-feedback"
          />
        )}
        <input
          onChange={props.onChange}
          className="form-control"
          type={props.type && "text"}
          placeholder={props.placeholder}
          value={props.value}
        />
      </div>
    </div>
  );
}
