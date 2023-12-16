import React from "react";
import Input from "../Input";
import { faSearch } from "@fortawesome/pro-solid-svg-icons";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <Input
      icon={faSearch}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search..."
      className="search-bar"
    />
  );
}
