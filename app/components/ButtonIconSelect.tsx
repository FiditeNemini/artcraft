import { useState } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

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
          className={twMerge(
            `flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all duration-150`,
            selectedOption === value
              ? "border-brand-primary bg-ui-panel/[0.2]"
              : "border-transparent hover:bg-ui-panel/[0.4]",
          )}
          onClick={() => handleOptionChange(value)}
        >
          <FontAwesomeIcon icon={icon} />
        </button>
      ))}
    </div>
  );
}
