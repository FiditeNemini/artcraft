import React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Button } from "components/common";
import Input from "components/common/Input";
// import useVoiceDetailsStore from "hooks/useVoiceDetailsStore/";
import Select from "components/common/TempSelect";

export const SearchFieldClass = {
  control: (state: any) =>
    state.isFocused ? "select-search focused rounded" : "select-search rounded",
  option: (state: any) => (state.isFocused ? "select-option" : "select-option"),
  input: (state: any) => (state.isFocused ? "select-input" : "select-input"),
  placeholder: (state: any) =>
    state.isFocused ? "select-placeholder" : "select-placeholder",
  singleValue: (state: any) =>
    state.isFocused ? "select-value" : "select-value",
  menu: (state: any) =>
    state.isFocused ? "select-container" : "select-container",
  indicatorSeparator: (state: any) =>
    state.isFocused ? "select-separator" : "select-separator",
};

function VoiceDetails({ datasetInputs }: { datasetInputs: any }) {
  const classNames = SearchFieldClass;

  return (
    <div>
      {datasetInputs.map(
        ({ type = "", options = [], ...props }, key: number) => {
          if (type === "text") return <Input {...{ ...props, key }} />;
          else return <Select {...{ ...props, classNames, key, options }} />;
        }
      )}
    </div>
  );
}

export { VoiceDetails };
