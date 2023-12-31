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
    <>
      {label && (
        <label className={`sub-title ${required ? "required" : ""}`}>
          {label}
        </label>
      )}
      <textarea className="form-control" {...rest} />
    </>
  );
}
