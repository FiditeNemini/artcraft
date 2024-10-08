import { useState } from "react";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Combobox as HeadlessComboBox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

interface ComboBoxInterface {
  options: string[];
  value: string;
  onChange: (newVal: string) => void;
}
export const Combobox = ({ options, value, onChange }: ComboBoxInterface) => {
  const [query, setQuery] = useState("");
  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          return option.toLowerCase().includes(option.toLowerCase());
        });

  return (
    <HeadlessComboBox
      value={value}
      onChange={onChange}
      onClose={() => setQuery("")}
    >
      <div className="flex">
        <ComboboxInput
          aria-label="Assignee"
          displayValue={(font: string) => font}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxButton className="">
          <FontAwesomeIcon
            icon={faChevronDown}
            className="size-4 fill-black/60 group-data-[hover]:fill-black"
          />
        </ComboboxButton>
      </div>
      <ComboboxOptions anchor="bottom" className="border empty:invisible">
        {filteredOptions.map((option, idx) => (
          <ComboboxOption
            key={idx}
            value={option}
            className="data-[focus]:bg-blue-100"
          >
            {option}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </HeadlessComboBox>
  );
};
