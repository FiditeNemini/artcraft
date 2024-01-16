import React from 'react';
import "./Label.scss";

interface Props {
  invalidReason?: string,
  label?: any,
  required?: boolean
}

export default function Label({ invalidReason, label, required }: Props) {
  return <div {...{ className: "fy-input-label" }}>
    { label ? <label {...{ className: `{required ? " required" : ""}` }}>
      { label }
    </label> : null }
    { invalidReason ? <span {...{ className: "form-text red is-danger" }}>
      { invalidReason }
    </span> : null }
  </div>;
};