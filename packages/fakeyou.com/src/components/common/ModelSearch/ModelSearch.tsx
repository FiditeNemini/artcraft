import React from "react";
import Input from "../Input";
import { faSearch } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSearch({ value, onChange }: Props) {
  return (
    <Input
      icon={faSearch}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
    />
  );
}
