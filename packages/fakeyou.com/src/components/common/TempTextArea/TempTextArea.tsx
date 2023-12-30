import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  textArea?: boolean;
}

export default function TempTextArea({ label, textArea, ...rest }: TextAreaProps) {
  return <>
    { label && <label className="sub-title">{ label }</label>}
    <div className="form-group">
      <textarea className="form-control" { ...rest } />
    </div>
  </>;
}
