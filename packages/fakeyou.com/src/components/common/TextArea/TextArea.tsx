import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  textArea?: boolean;
}

export default function TextArea({ label, textArea, ...rest }: TextAreaProps) {
  return (
    <div>
      {label && <label className="sub-title">{label}</label>}

      <div className="form-group">
        <textarea className="form-control" {...rest} />
      </div>
    </div>
  );
}
