import React, { useEffect, useState } from "react";
import "./SelectionBubbles.scss";

interface SelectionBubbleProps {
  options: string[];
  onSelect: (selected: string) => void;
}

export default function SelectionBubbles({
  options,
  onSelect,
}: SelectionBubbleProps) {
  //Select first one as default
  const [selectedOption, setSelectedOption] = useState<string | null>(
    options.length > 0 ? options[0] : null
  );

  const handleSelect = (
    event: React.MouseEvent<HTMLButtonElement>,
    option: string
  ) => {
    event.preventDefault();
    setSelectedOption(option);
    onSelect(option);
  };

  useEffect(() => {
    if (selectedOption) {
      onSelect(selectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="selection-bubbles">
      {options.map(option => (
        <button
          key={option}
          className={`bubble-button ${
            selectedOption === option ? "selected" : ""
          }`}
          onClick={event => handleSelect(event, option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
