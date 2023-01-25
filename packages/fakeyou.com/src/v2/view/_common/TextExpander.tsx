import React, { useState } from "react";

interface Props {
  text: string;
}

export const TextExpander: React.FC<Props> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  const shortText = text.slice(0, 250) + "...";

  return (
    <>
      {expanded ? text : shortText}
      {text.length > 250 && (
        <button
          className="btn-link fw-medium p-0 ps-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </>
  );
};
