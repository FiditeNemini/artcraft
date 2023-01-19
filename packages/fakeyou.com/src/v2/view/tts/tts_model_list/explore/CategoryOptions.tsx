
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightLong,
  faCaretRight,
  faMicrophone,
  faTags,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { Trans, useTranslation } from "react-i18next";
import { Analytics } from "../../../../../common/Analytics";
import Select from "react-select";
import { SearchFieldClass } from "../SearchFieldClass";

interface Props {
  allTtsCategories: TtsCategoryType[];
  allTtsModels: TtsModelListItem[];

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;

  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;
}

export function CategoryOptions(props: Props) {
  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  return (
    <div className="d-flex flex-column flex-md-row gap-2">
      <div className="w-100">
      <span className="form-control-feedback">
        <FontAwesomeIcon icon={faTags} />
      </span>
      <Select
          defaultValue={options[2]}
          options={options}
          classNames={SearchFieldClass}
          className="w-100"
      />
    </div>
    <div className="d-none d-md-flex align-items-center">
      <FontAwesomeIcon
          icon={faArrowRightLong}
          className="fs-6 opacity-75"
      />
    </div>
    <div className="w-100">
      <span className="form-control-feedback">
          <FontAwesomeIcon icon={faTags} />
      </span>
      <Select
          defaultValue={options[2]}
          options={options}
          classNames={SearchFieldClass}
          className="w-100"
      />
    </div>
    <div className="d-none d-md-flex align-items-center">
      <FontAwesomeIcon
          icon={faArrowRightLong}
          className="fs-6 opacity-75"
      />
    </div>
    <div className="w-100">
      <span className="form-control-feedback">
          <FontAwesomeIcon icon={faTags} />
      </span>
      <Select
          defaultValue={options[2]}
          options={options}
          classNames={SearchFieldClass}
          className="w-100"
      />
    </div>
  </div>
  );
}