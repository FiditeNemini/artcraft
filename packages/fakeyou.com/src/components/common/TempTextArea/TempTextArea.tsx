import React from "react";
import "./TextArea.scss";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  textArea?: boolean;
  required?: boolean;
}

export default function TempTextArea({
  label,
  textArea,
  required,
  ...rest
}: TextAreaProps) {
  return (
    // Changed fragment to div here just so that it can be laid out with bootstrap easily using d-flex, flex-column and responsive gaps which requires grouping.
    <div className="fy-textarea">
      {label && (
        <label className={`sub-title ${required ? "required" : ""}`}>
          {label}
        </label>
      )}
      <textarea className="form-control" {...rest} />
    </div>
  );
}
