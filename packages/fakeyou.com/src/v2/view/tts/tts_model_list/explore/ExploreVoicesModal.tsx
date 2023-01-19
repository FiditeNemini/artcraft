import React from "react";
import { faArrowRightLong, faCompass, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LanguageOptions } from "./LanguageOptions";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { OldMultiDropdownSearch } from "./OldMultiDropdownSearch";
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

  return (
    <div
      className="modal fade"
      id="exploreModal"
      aria-labelledby="ModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered modal-dialog-scrollable">
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
                <div className="d-flex">
                  <label className="sub-title flex-grow-1">
                  Category
                  </label>
                  <a href="/" className="ms-3 fw-medium">
                  Clear category filters
                  </a>
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
                  setMaybeSelectedTtsModel={
                    props.setMaybeSelectedTtsModel
                  }
                  />
            </div>
          </div>

          <br />
          <hr />
          <br />

          <div className="row gx-3 gy-3">
            <ScopedVoiceModelOptions
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
                  setMaybeSelectedTtsModel={
                    props.setMaybeSelectedTtsModel
                  }
              />

            <OldMultiDropdownSearch
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
                  setMaybeSelectedTtsModel={
                    props.setMaybeSelectedTtsModel
                  }
              />

          </div>

        </div>
      </div>
    </div>
  </div>
  )
}
