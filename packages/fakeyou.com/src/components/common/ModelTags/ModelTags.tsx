import React from "react";
import CheckableTag from "../CheckableTag";

interface Props {
  tags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
}

export default function ModelTags({ tags, selectedTags, onSelectTag }: Props) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <CheckableTag
          key={tag}
          tag={tag}
          isSelected={selectedTags.includes(tag)}
          onToggle={onSelectTag}
        />
      ))}
    </div>
  );
}
