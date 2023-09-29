import React from 'react';
import { useId } from "hooks";
import makeClass from "resources/makeClass";

interface Props {
  checked?: boolean;
  className?: string;
  label?: string;
  name?: string;
  onChange?: any;
}

export default function Checkbox({ checked = false, className = "", label = "", name = "", onChange }: Props) {
  const id = "checkbox-" + useId();
  return <div {...makeClass("form-check",className) }>
    <input {...{ className: "form-check-input", id, type: "checkbox", name, onChange, checked }} />
    { label && <label {...{ className: "form-check-label", for: id, }}>{ label }</label> } 
  </div>
};