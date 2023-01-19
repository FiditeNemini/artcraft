import React from "react";
import {
  faArrowRight,
  faCompass,
  faEraser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LanguageOptions } from "./LanguageOptions";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { CategoryOptions } from "./CategoryOptions";
import { ScopedVoiceModelOptions } from "./ScopedVoiceModelOptions";

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

export function ExploreVoicesModal(props: Props) {
  const {
    allTtsCategories,
    allTtsCategoriesByTokenMap,
    ttsModelsByCategoryToken,
    dropdownCategories,
    setDropdownCategories,
    selectedCategories,
    setSelectedCategories,
    maybeSelectedTtsModel,
  } = props;

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

  const handleChangeCategory = (level: number, maybeCategoryToken?: string) => {
    if (!maybeCategoryToken) {
      return true;
    }
    doChangeCategory(level, maybeCategoryToken);
    return true;
  };

  return (
    <div
      className="modal fade"
      id="exploreModal"
      aria-labelledby="ModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header p-3">
            <h5 className="modal-title fw-semibold" id="ModalLabel">
              <FontAwesomeIcon icon={faCompass} className="me-3" />
              Explore Voices
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-3 p-lg-4">
            <div className="row gx-3 gy-3">
              <div className="col-12 col-lg-3 input-icon-search">
                <label className="sub-title">Language</label>
                <LanguageOptions />
              </div>

              <div className="col-12 col-md-12 col-lg-9 input-icon-search">
                <div className="d-flex align-items-start">
                  <label className="sub-title flex-grow-1">Category</label>
                  <button
                    className="ms-3 fw-medium btn-link"
                    onClick={() => {
                      handleChangeCategory(0, "*");
                    }}
                  >
                    <FontAwesomeIcon icon={faEraser} className="me-2" />
                    Clear category filters
                  </button>
                </div>

                <CategoryOptions
                  allTtsCategories={props.allTtsCategories}
                  allTtsModels={props.allTtsModels}
                  allTtsCategoriesByTokenMap={props.allTtsCategoriesByTokenMap}
                  allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
                  ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
                  dropdownCategories={props.dropdownCategories}
                  setDropdownCategories={props.setDropdownCategories}
                  selectedCategories={props.selectedCategories}
                  setSelectedCategories={props.setSelectedCategories}
                  maybeSelectedTtsModel={props.maybeSelectedTtsModel}
                  setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
                  handleChangeCategory={handleChangeCategory}
                />
              </div>
            </div>

            <br />

            <div className="row gx-3 gy-3">
              <ScopedVoiceModelOptions
                allTtsCategories={props.allTtsCategories}
                allTtsModels={props.allTtsModels}
                allTtsCategoriesByTokenMap={props.allTtsCategoriesByTokenMap}
                allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
                ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
                dropdownCategories={props.dropdownCategories}
                selectedCategories={props.selectedCategories}
                maybeSelectedTtsModel={props.maybeSelectedTtsModel}
                setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
              />
            </div>
          </div>

          <br />

          <button
            type="button"
            className="btn btn-primary rounded-top-0"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            Use this voice
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
