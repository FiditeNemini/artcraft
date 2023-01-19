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
import Select, { ActionMeta } from "react-select";
//import Option from "react-select";
import { SearchFieldClass } from "../search/SearchFieldClass";

interface Props {
  allTtsCategories: TtsCategoryType[];
  allTtsModels: TtsModelListItem[];

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  selectedCategories: TtsCategoryType[];

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;
}

export function ScopedVoiceModelOptions(props: Props) {
  const {
    allTtsModels,
    ttsModelsByCategoryToken,
    selectedCategories,
    maybeSelectedTtsModel,
  } = props;

  const { t } = useTranslation();

  const handleChange = (option: any, actionMeta: any) => {
    const ttsModelToken = option?.value;
    const maybeNewTtsModel = props.allTtsModelsByTokenMap.get(ttsModelToken);

    if (maybeNewTtsModel === undefined) {
      return;
    }

    props.setMaybeSelectedTtsModel(maybeNewTtsModel);
  }


  const leafiestCategory = selectedCategories[selectedCategories.length - 1];

  let leafiestCategoryModels: Array<TtsModelListItem> = new Array();

  if (leafiestCategory !== undefined) {
    leafiestCategoryModels =
      Array.from(
        ttsModelsByCategoryToken.get(leafiestCategory.category_token) || 
          new Set());
  } else {
    leafiestCategoryModels = Array.from(new Set(allTtsModels));
  }

  let options = leafiestCategoryModels.map((ttsModel) => {
    return {
      label: ttsModel.title,
      value: ttsModel.model_token,
    }
  });

  let selectedOption = options.find((option) => option.value === maybeSelectedTtsModel?.model_token);

  if (selectedOption === undefined && options.length > 0) {
    selectedOption = options[0];
  }
 
  const voiceCount = leafiestCategoryModels.length;

  return (
    <>
      <div className="col">
        <label className="sub-title">
          <Trans
            i18nKey="tts.TtsModelListPage.form.voicesLabel"
            count={voiceCount}
          >
            Voice ({voiceCount} to choose from)
          </Trans>
        </label>

        <div className="zi-3 input-icon-search">
          <span className="form-control-feedback">
            <FontAwesomeIcon icon={faMicrophone} />
          </span>

          <Select
            defaultValue={selectedOption}
            options={options}
            classNames={SearchFieldClass}
            onChange={handleChange}
            />
        </div>
      </div>
    </>
  )
}
