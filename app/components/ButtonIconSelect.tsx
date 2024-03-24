// ButtonIconSelect.tsx
import { useState } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Option {
  value: string;
  icon: IconDefinition;
}

interface ButtonIconSelectProps {
  options: Option[];
  onOptionChange?: (value: string) => void;
}

export function ButtonIconSelect({
  options,
  onOptionChange,
}: ButtonIconSelectProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    options[0].value,
  );

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (onOptionChange) {
      onOptionChange(value);
    }
  };

  return (
    <div className="flex space-x-1">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          className={`flex h-8 w-8 items-center justify-center transition-all duration-150 hover:bg-ui-panel/[0.4] ${selectedOption === value ? "border-2 border-brand-primary bg-ui-panel/[0.2]" : "border-2 border-transparent"} rounded-lg`}
          onClick={() => handleOptionChange(value)}
        >
          <FontAwesomeIcon icon={icon} />
        </button>
      ))}
    </div>
  );
}
