import React from "react";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../AppWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import Select, { ActionMeta } from "react-select";
import Option from "react-select";
import { SearchFieldClass } from "./SearchFieldClass";

// NB: This probably is not the best autocomplete library in the world
// A lot of the libraries are really old and depend on jQuery (gross).
// This one seemed to be simple and minimal, but unfortunately it doesn't
// use any sort of Trie or caching, and it's almost too minimal.

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
}

export function SelectSearch(props: Props) {
  const options : any = props.allTtsModels.map((ttsModel) => {
    return { value: ttsModel.model_token, label: ttsModel.title }
  });


  const handleChange = (option: any, actionMeta: ActionMeta<Option>) => {
    const ttsModelToken = option?.value;
    const maybeNewTtsModel = props.allTtsModelsByTokenMap.get(ttsModelToken);

    if (maybeNewTtsModel === undefined) {
      return;
    }

    props.setMaybeSelectedTtsModel(maybeNewTtsModel);
  }

  // TODO/FIXME: The default option is not working.
  let defaultOption = options.length > 0 ? options[0] : undefined;

  //let defaultText = options.length > 0 ? options[0].label : "Search for a voice... (loading)";

  if (props.maybeSelectedTtsModel !== undefined) {
    defaultOption = { 
      value: props.maybeSelectedTtsModel.model_token, 
      label: props.maybeSelectedTtsModel.title,
    };
  }

  return (
    <>
      <div className="zi-3 input-icon-search">
        <span className="form-control-feedback">
          <FontAwesomeIcon icon={faMicrophone} />
        </span>
        <Select
          //defaultInputValue={defaultText}
          defaultValue={defaultOption}
          isSearchable={true}
          options={options}
          classNames={SearchFieldClass}
          onChange={handleChange}
        />
      </div>
    </>
  );
}
