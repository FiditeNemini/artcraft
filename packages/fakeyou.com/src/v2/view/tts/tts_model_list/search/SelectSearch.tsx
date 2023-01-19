import React from "react";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Select, { ActionMeta, createFilter } from "react-select";
import Option from "react-select";
import { SearchFieldClass } from "./SearchFieldClass";
import { FastReactSelectOption } from "../../../_common/FastReactSelectOption";

interface Props {
  allTtsCategories: TtsCategoryType[];
  allTtsModels: TtsModelListItem[];
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;

  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;

  selectedTtsLanguageScope: string,
}

export function SelectSearch(props: Props) {

  const handleChange = (option: any, actionMeta: ActionMeta<Option>) => {
    const ttsModelToken = option?.value;
    const maybeNewTtsModel = props.allTtsModelsByTokenMap.get(ttsModelToken);

    if (maybeNewTtsModel === undefined) {
      return;
    }

    props.setMaybeSelectedTtsModel(maybeNewTtsModel);
  }

  const options : any = props.allTtsModels
    .filter((ttsModel) => {
      // Scope to currently selected language
      if (props.selectedTtsLanguageScope === "*") {
        return true; // NB: Sentinel value of "*" means all languages.
      }
      return ttsModel.ietf_primary_language_subtag === props.selectedTtsLanguageScope;
    })
    .map((ttsModel) => {
      return { value: ttsModel.model_token, label: ttsModel.title }
    });

  let defaultOption = options.length > 0 ? options[0] : undefined;

  if (props.maybeSelectedTtsModel !== undefined) {
    defaultOption = { 
      value: props.maybeSelectedTtsModel.model_token, 
      label: props.maybeSelectedTtsModel.title,
    };
  }

  let isLoading = false;

  if (props.allTtsModels.length === 0) {
    // NB: react-select will cache values, even across different instances (!!!)
    // This can cause confusion when initializing a select instance before the data
    // is loaded, and the select will never update to show the new data.
    // The proper way to change voices after load from a placeholder "Loading..."
    // label is to use controlled props / value as is done here:
    isLoading = true;
    defaultOption = {
      label: "Loading...",
      value: "*",
    }
  }
  
  return (
    <>
      <div className="zi-3 input-icon-search">
        <span className="form-control-feedback">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <Select
          value={defaultOption} // Controlled components use "value" instead of "defaultValue".
          isSearchable={true}
          isLoading={isLoading}
          options={options}
          classNames={SearchFieldClass}
          onChange={handleChange}
          // NB: The following settings improve upon performance. 
          // See: https://github.com/JedWatson/react-select/issues/3128
          filterOption={createFilter({ignoreAccents: false})}
          components={{Option: FastReactSelectOption} as any}
        />
      </div>
    </>
  );
}
