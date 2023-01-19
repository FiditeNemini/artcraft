import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faMicrophone,
  faTags,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { Trans, useTranslation } from "react-i18next";
import { Analytics } from "../../../../../common/Analytics";

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

export function OldMultiDropdownSearch(props: Props) {
  const {
    allTtsCategories,
    allTtsModels,
    allTtsCategoriesByTokenMap,
    allTtsModelsByTokenMap,
    ttsModelsByCategoryToken,
    dropdownCategories,
    setDropdownCategories,
    selectedCategories,
    setSelectedCategories,
    maybeSelectedTtsModel,
  } = props;

  const { t } = useTranslation();

  const isLoading = allTtsModels.length === 0;

  useEffect(() => {
    // NB: Dropdowns do not seem to respect React very well.
    // Despite setting <select>'s value and defaultValue, and <option>'s selected=true,
    // the dropdowns are left in a default state. I'll use the post-render side effect
    // to select the correct options.

    let selectedModelToken = undefined;

    if (maybeSelectedTtsModel) {
      selectedModelToken = maybeSelectedTtsModel.model_token;
    } else if (allTtsModels.length > 0) {
      // TODO: Move the initial model selection logic here, perhaps.
      //selectedModelToken = allTtsModels[0].model_token;
    }

    let maybeElement = document.getElementsByName("tts-model-select")[0];

    if (!!maybeElement && !!selectedModelToken) {
      (maybeElement as any).value = selectedModelToken;
    } else if (isLoading) {
      (maybeElement as any).value = ""; // Empty string will match "loading" <option>
    }

    let categoryDropdownElements =
      document.getElementsByClassName("category-dropdown");

    const iterLength = Math.min(
      selectedCategories.length,
      categoryDropdownElements.length
    );

    for (let i = 0; i < iterLength; i++) {
      let categoryDropdownElement = categoryDropdownElements[i];
      let selectedCategory = selectedCategories[i];
      if (!categoryDropdownElements || !selectedCategory) {
        break;
      }
      (categoryDropdownElement as any).value = selectedCategory.category_token;
    }
  });

  const doChangeCategory = (level: number, maybeToken: string) => {
    // Slice off all the irrelevant child category choices, then append new choice.
    let newCategorySelections = selectedCategories.slice(0, level);

    // And the dropdowns themselves
    let newDropdownCategories = dropdownCategories.slice(0, level + 1);

    let category = allTtsCategoriesByTokenMap.get(maybeToken);
    if (!!category) {
      newCategorySelections.push(category);
    }

    setSelectedCategories(newCategorySelections);

    const newSubcategories = allTtsCategories.filter((category) => {
      return category.maybe_super_category_token === maybeToken;
    });

    newDropdownCategories.push(newSubcategories);
    setDropdownCategories(newDropdownCategories);

    // We might have switched into a category without our selected TTS model.
    // If so, pick a new TTS model.
    let maybeNewModel = undefined;
    const availableModelsForCategory = ttsModelsByCategoryToken.get(maybeToken);
    if (!!availableModelsForCategory && !!maybeSelectedTtsModel) {
      const modelValid = availableModelsForCategory.has(maybeSelectedTtsModel);
      if (!modelValid) {
        maybeNewModel = Array.from(availableModelsForCategory)[0];
      }
    }
    if (!!maybeNewModel) {
      props.setMaybeSelectedTtsModel(maybeNewModel);
    }
  };

  const handleChangeCategory = (
    ev: React.FormEvent<HTMLSelectElement>,
    level: number
  ) => {
    const maybeToken = (ev.target as HTMLSelectElement).value;
    if (!maybeToken) {
      return true;
    }
    doChangeCategory(level, maybeToken);
    return true;
  };

  const handleRemoveCategory = (level: number) => {
    let parentLevel = Math.max(level - 1, 0);
    let maybeToken = "*"; // NB: Sentinel for the "All Voices" / "Select..." <option>

    doChangeCategory(parentLevel, maybeToken);

    // NB: There's a bug selecting the "default" of the parent category.
    // React won't respect the state, so we'll brute force it here.
    let maybeElement = document.getElementsByName(
      `categories-${parentLevel}`
    )[0];
    if (maybeElement) {
      (maybeElement as any).value = "*";
    }
  };

  const handleChangeVoice = (ev: React.FormEvent<HTMLSelectElement>) => {
    const ttsModelToken = (ev.target as HTMLSelectElement).value;
    const maybeTtsModel = allTtsModelsByTokenMap.get(ttsModelToken);
    if (maybeTtsModel) {
      props.setMaybeSelectedTtsModel(maybeTtsModel);
    }
  };

  let categoryDropdowns = [];

  for (let i = 0; i < dropdownCategories.length; i++) {
    const currentDropdownCategories = dropdownCategories[i];

    let defaultName = i === 0 ? "All Voices" : "Select...";

    let dropdownOptions = [];
    dropdownOptions.push(
      <option key={`option-${i}-*`} value="*">
        {defaultName}
      </option>
    );

    currentDropdownCategories.forEach((category) => {
      const models = ttsModelsByCategoryToken.get(category.category_token);
      if (models === undefined || models.size === 0) {
        return; // If there are no models at the leaves, skip
      }
      dropdownOptions.push(
        <option
          key={`option-${i}-${category.category_token}`}
          value={category.category_token}
        >
          {category.name_for_dropdown}
        </option>
      );
    });

    if (dropdownOptions.length <= 1) {
      // We've run out of subcategories. (1 == "Select...")
      // No sense trying to build more.
      break;
    }

    const selectCssClasses = "category-dropdown form-select"; // NB: 'category-dropdown' is important for function.
    const xButtonCssClasses = "btn btn-destructive btn-inform";

    categoryDropdowns.push(
      <React.Fragment key={`categoryDropdown-${i}`}>
        <div className="d-flex gap-3 align-items-center mb-4 w-100">
          <div className="form-group input-icon w-100">
            <select
              onClick={() => {
                Analytics.ttsClickSelectCategory();
              }}
              className={selectCssClasses}
              name={`categories-${i}`}
              onChange={(ev) => handleChangeCategory(ev, i)}
              defaultValue="*"
            >
              {dropdownOptions}
            </select>
            <span className="form-control-feedback">
              <FontAwesomeIcon icon={faTags} />
            </span>
          </div>

          <div>
            <button
              className={xButtonCssClasses}
              onClick={() => handleRemoveCategory(i)}
            >
              <span className="icon is-normal">
                <FontAwesomeIcon
                  icon={faTimes}
                  title="remove"
                  color="#ffffff"
                />
              </span>
            </button>
          </div>

          <div className="control">
            <FontAwesomeIcon icon={faCaretRight} size="2x" color="#999" />
          </div>
        </div>
      </React.Fragment>
    );
  }

  // Group categories into rows of two (on Desktop)
  let groupSize = window.innerWidth < 550 ? 1 : 2;
  let categoryFields = [];
  let categoryFieldGroups = [];

  for (let i = 0; i < categoryDropdowns.length; i++) {
    categoryFields.push(categoryDropdowns[i]);

    if (categoryFields.length >= groupSize) {
      categoryFieldGroups.push(
        <div
          className="d-flex gap-0 flex-column flex-lg-row gap-lg-3"
          key={`fieldGroup-${i}`}
        >
          {categoryFields.splice(0, categoryFields.length)}
        </div>
      );
    }
  }

  if (categoryFields.length >= 0) {
    categoryFieldGroups.push(
      <div className="d-flex" key="fieldGroup-last">
        {categoryFields.splice(0, categoryFields.length)}
      </div>
    );
  }

  const leafiestCategory = selectedCategories[selectedCategories.length - 1];

  let leafiestCategoryModels: Set<TtsModelListItem> = new Set();
  if (leafiestCategory !== undefined) {
    leafiestCategoryModels =
      ttsModelsByCategoryToken.get(leafiestCategory.category_token) ||
      new Set();
  } else {
    leafiestCategoryModels = new Set(allTtsModels);
  }

  const voiceCount = leafiestCategoryModels.size;

  let selectClasses = "form-select";
  let loadingOption = undefined;

  if (isLoading) {
    selectClasses = "form-select";
    loadingOption = (
      <option key="waiting" value="" disabled={true}>
        {t("tts.TtsModelListPage.form.asyncLoadingDropdownValue")}
      </option>
    );
  }

  return (
    <div>
      {/* Model Dropdown */}
      <label className="sub-title">
        <Trans
          i18nKey="tts.TtsModelListPage.form.voicesLabel"
          count={voiceCount}
        >
          Voice ({voiceCount} to choose from)
        </Trans>
      </label>
      <div className="form-group input-icon">
        <span className="form-control-feedback">
          <FontAwesomeIcon icon={faMicrophone} />
        </span>
        <select
          className={selectClasses}
          name="tts-model-select"
          onChange={handleChangeVoice}
          onClick={() => {
            Analytics.ttsSelectVoiceFromCategory();
          }}
          disabled={isLoading}
        >
          {isLoading
            ? loadingOption
            : Array.from(leafiestCategoryModels).map((model) => {
                return (
                  <option key={model.model_token} value={model.model_token}>
                    {model.title} ({t("tts.TtsModelListPage.form.by")}{" "}
                    {model.creator_display_name})
                  </option>
                );
              })}
        </select>
      </div>
    </div>
  );
}
