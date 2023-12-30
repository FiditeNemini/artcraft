import React from "react";

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
      <div className="form-group">
        <textarea className="form-control" {...rest} />
      </div>
    </>
  );
}
