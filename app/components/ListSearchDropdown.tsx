import { Fragment, useState, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { faCheck, faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  disableHotkeyInput,
  enableHotkeyInput,
  DomLevels,
} from "~/pages/PageEnigma/store";

interface ListDropdownProps {
  list: { [key: string]: string }[];
  listDisplayKey?: string;
  onSelect: (val: string) => void;
}
export const ListSearchDropdown = ({
  list,
  listDisplayKey,
  onSelect,
}: ListDropdownProps) => {
  const [selected, setSelected] = useState(list[0]);
  const [query, setQuery] = useState("");

  const filteredList =
    query === ""
      ? list
      : list.filter((item) => {
          if (listDisplayKey)
            return item[listDisplayKey]
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, ""));

          return Object.values(item)[0]
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""));
        });

  useEffect(() => {
    if (listDisplayKey) onSelect(selected[listDisplayKey]);
    else onSelect(Object.values(selected)[0]);
  }, [selected]);

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default rounded-md text-left shadow-md sm:text-sm">
          <Combobox.Input
            className="w-full rounded-md border-none bg-brand-secondary py-2 pl-3 pr-10 text-sm leading-5 text-white outline-none outline-offset-0 transition-all duration-150 ease-in-out focus:outline-brand-primary"
            displayValue={(item: { [key: string]: string }) => {
              if (listDisplayKey) return item[listDisplayKey];
              else return Object.values(item)[0];
            }}
            onFocus={() => {
              disableHotkeyInput(DomLevels.INPUT);
            }}
            onBlur={() => {
              enableHotkeyInput(DomLevels.INPUT);
            }}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-brand-secondary py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {filteredList.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-white">
                Nothing found.
              </div>
            ) : (
              filteredList.map((item, itemIdx) => {
                if (itemIdx <= 10)
                  return (
                    <Combobox.Option
                      key={itemIdx}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? "text-white" : "text-gray-400"
                        }`
                      }
                      value={item}>
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}>
                            {!listDisplayKey && Object.values(item)[0]}
                            {listDisplayKey && item[listDisplayKey]}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-teal-600"
                              }`}>
                              <FontAwesomeIcon
                                icon={faCheck}
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  );
                return null;
              })
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};
