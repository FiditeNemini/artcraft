import {
  faEye,
  faMicrophoneLines,
  faTags,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useVoiceDetailsStore } from "hooks/useVoiceDetailsStore";
import React from "react";
import Select from "react-select";

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
  const {
    name,
    vocalType,
    tags,
    description,
    visibility,
    setName,
    setVocalType,
    setTags,
    setDescription,
    setVisibility,
  } = useVoiceDetailsStore();

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row gy-4">
        <div className="col-12 col-md-8">
          <label className="sub-title">Name</label>
          <input
            className="form-control"
            type="text"
            placeholder="Voice name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="sub-title">Vocal Type</label>
          <div className="input-icon-search">
            <span className="form-control-feedback">
              <FontAwesomeIcon icon={faMicrophoneLines} />
            </span>
            <Select
              classNames={SearchFieldClass}
              value={vocalType}
              onChange={(e) => setVocalType(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="sub-title">Tags</label>
        <div className="input-icon-search">
          <span className="form-control-feedback">
            <FontAwesomeIcon icon={faTags} />
          </span>
          <Select
            classNames={SearchFieldClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="sub-title">Description</label>
        <textarea
          className="form-control"
          placeholder="Describe the voice - eg. Squeaky male cartoon character voice"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="sub-title">Visibility</label>
        <div className="input-icon-search">
          <span className="form-control-feedback">
            <FontAwesomeIcon icon={faEye} />
          </span>
          <Select
            classNames={SearchFieldClass}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export { VoiceDetails };
