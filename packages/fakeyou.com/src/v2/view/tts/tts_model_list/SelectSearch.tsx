import React, { useState } from "react";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../AppWrapper";
import Autocomplete from "react-autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faSearch } from "@fortawesome/free-solid-svg-icons";
import { t } from "i18next";
import { Analytics } from "../../../../common/Analytics";
import Select from "react-select";
import AsyncSelect from "react-select/async";
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
  // const [searchValue, setSearchValue] = useState<string>("");

  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  return (
    <>
      <div className="zi-3 input-icon-search">
        <span className="form-control-feedback">
          <FontAwesomeIcon icon={faMicrophone} />
        </span>
        <Select
          defaultValue={options[2]}
          options={options}
          classNames={SearchFieldClass}
        />
      </div>
    </>
  );
}
