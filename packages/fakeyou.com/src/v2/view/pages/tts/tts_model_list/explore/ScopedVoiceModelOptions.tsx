import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../../AppWrapper";
import { Trans } from "react-i18next";
import Select, { createFilter } from "react-select";
import { SearchFieldClass } from "../search/SearchFieldClass";
import { FastReactSelectOption } from "../../../../_common/FastReactSelectOption";
import { Analytics } from "../../../../../../common/Analytics";

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

  selectedTtsLanguageScope: string;
}

export function ScopedVoiceModelOptions(props: Props) {
  const {
    allTtsModels,
    ttsModelsByCategoryToken,
    selectedCategories,
    maybeSelectedTtsModel,
  } = props;

  //const { t } = useTranslation();

  const handleChange = (option: any, actionMeta: any) => {
    const ttsModelToken = option?.value;
    const maybeNewTtsModel = props.allTtsModelsByTokenMap.get(ttsModelToken);
    if (maybeNewTtsModel !== undefined) {
      props.setMaybeSelectedTtsModel(maybeNewTtsModel);
    }
  };

  const leafiestCategory = selectedCategories[selectedCategories.length - 1];

  let leafiestCategoryModels: Array<TtsModelListItem> = [];

  if (leafiestCategory !== undefined) {
    leafiestCategoryModels = Array.from(
      ttsModelsByCategoryToken.get(leafiestCategory.category_token) || new Set()
    );
  } else {
    leafiestCategoryModels = Array.from(new Set(allTtsModels));
  }

  let options = leafiestCategoryModels
    .filter((ttsModel) => {
      // Scope to currently selected language
      if (props.selectedTtsLanguageScope === "*") {
        return true; // NB: Sentinel value of "*" means all languages.
      }
      return (
        ttsModel.ietf_primary_language_subtag === props.selectedTtsLanguageScope
      );
    })
    .map((ttsModel) => {
      return {
        label: ttsModel.title,
        value: ttsModel.model_token,
      };
    });

  let selectedOption = options.find(
    (option) => option.value === maybeSelectedTtsModel?.model_token
  );

  if (selectedOption === undefined && options.length > 0) {
    // NB: We shouldn't select the first item in the list since that won't update the currently
    // selected model. If the user were to close the dialogue, they'd think they had picked a voice,
    // when in reality no state would have changed. By forcing the user to choose, the user will set
    // the state appropriately.
    selectedOption = {
      label: "Select voice...",
      value: "*",
    };
  }

  const voiceCount = options.length;

  let isLoading = false;

  if (props.allTtsModels.length === 0) {
    // NB: react-select will cache values, even across different instances (!!!)
    // This can cause confusion when initializing a select instance before the data
    // is loaded, and the select will never update to show the new data.
    // The proper way to change voices after load from a placeholder "Loading..."
    // label is to use controlled props / value as is done here:
    isLoading = true;
    selectedOption = {
      label: "Loading...",
      value: "*",
    };
  } else if (options.length === 0) {
    // NB: Perhaps the user has refined their search to be too narrow (langauge + category)
    selectedOption = {
      label: "No results (remove some filters)",
      value: "*",
    };
  }

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

        <div className="input-icon-search">
          <span className="form-control-feedback">
            <FontAwesomeIcon icon={faMicrophone} />
          </span>

          <Select
            value={selectedOption}
            options={options}
            classNames={SearchFieldClass}
            onChange={handleChange}
            onMenuOpen={() => {
              Analytics.ttsOpenScopedVoiceSelectMenu();
            }}
            isLoading={isLoading}
            // On mobile, we don't want the onscreen keyboard to take up half the UI.
            autoFocus={false}
            isSearchable={false}
            // NB: The following settings improve upon performance.
            // See: https://github.com/JedWatson/react-select/issues/3128
            filterOption={createFilter({ ignoreAccents: false })}
            components={{ Option: FastReactSelectOption } as any}
          />
        </div>
      </div>
    </>
  );
}
