import {
  faEye,
  faLanguage,
  // faMicrophoneLines,
  // faTags,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "components/common";
import Input from "components/common/Input";
import useVoiceDetailsStore from "hooks/useVoiceDetailsStore/";
import React from "react";
import Select from "components/common/Select";

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

function VoiceDetails() {
  const { name, visibility, setName, setVisibility } = useVoiceDetailsStore();

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row gy-4">
        <Input label="Name" placeholder="Voice name" />
      </div>

      <div>
        <Select
          classNames={SearchFieldClass}
          value="English"
          defaultValue="English"
          placeholder="English"
          icon={faLanguage}
          label="Language"
        />
      </div>

      <div>
        <Select
          classNames={SearchFieldClass}
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          icon={faEye}
          label="Visibility"
        />
      </div>
    </div>
  );
}

export { VoiceDetails };
