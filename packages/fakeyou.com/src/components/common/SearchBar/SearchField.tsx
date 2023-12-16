import React from "react";
import Input from "../Input";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchField({
  value,
  onChange,
  onFocus,
  onBlur,
}: SearchFieldProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search for a model weight"
      className="search-field"
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
