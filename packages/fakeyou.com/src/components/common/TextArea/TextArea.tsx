import React from "react";
import "./TextArea.scss";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  textArea?: boolean;
  required?: boolean;
  resize?: boolean;
}

export default function TextArea({
  label,
  textArea,
  required,
  resize = true,
  ...rest
}: TextAreaProps) {
  return (
    <div className="fy-textarea">
      {label && (
        <label className={`sub-title ${required ? "required" : ""}`.trim()}>
          {label}
        </label>
      )}
      <textarea
        className={`form-control ${resize ? "" : "no-resize"}`.trim()}
        {...rest}
      />
    </div>
  );
}
