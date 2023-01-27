import React, { useState } from "react";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TtsCategoryType } from "../../../../../../AppWrapper";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { ExploreVoicesTray } from "./components/ExploreVoicesTray";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-duotone-svg-icons";
import { ScopedVoiceModelOptions } from "./components/ScopedVoiceModelOptions";
import { VoiceCountLabel } from "./components/VoiceCountLabel";
import { Analytics } from "../../../../../../common/Analytics";

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

  selectedTtsLanguageScope: string;
  setSelectedTtsLanguageScope: (selectedTtsLanguageScope: string) => void;
}

export function SearchOmnibar(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickExplore = () => {
    setIsOpen(!isOpen);
  };

  const canSearchVoices = !isOpen; // TODO: Perhaps only set false on mobile.

  return (
    <>
      <div
        className={`sliding-content ${
          isOpen ? "open pb-4" : "closed"
        }`}
      >
        <ExploreVoicesTray
          allTtsCategories={props.allTtsCategories}
          allTtsModels={props.allTtsModels}
          allTtsCategoriesByTokenMap={
            props.allTtsCategoriesByTokenMap
          }
          allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
          ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
          dropdownCategories={props.dropdownCategories}
          setDropdownCategories={props.setDropdownCategories}
          selectedCategories={props.selectedCategories}
          setSelectedCategories={props.setSelectedCategories}
          maybeSelectedTtsModel={props.maybeSelectedTtsModel}
          setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
          selectedTtsLanguageScope={props.selectedTtsLanguageScope}
          setSelectedTtsLanguageScope={
            props.setSelectedTtsLanguageScope
          }
        />
      </div>

      <div className="pb-4">
        <VoiceCountLabel
          allTtsModels={props.allTtsModels}
          ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
          selectedCategories={props.selectedCategories}
          selectedTtsLanguageScope={props.selectedTtsLanguageScope}
        />

        <div className="d-flex flex-column flex-lg-row gap-3 zi-2">
          <div className="flex-grow-1">
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
              selectedTtsLanguageScope={props.selectedTtsLanguageScope}
              canSearchVoices={canSearchVoices}
            />
          </div>

          {}

          <button
            onClick={() => {
              Analytics.ttsOpenExploreVoicesModal();
              handleClickExplore();
            }}
            className="btn btn-primary rounded-50"
            type="button"
          >
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="me-2"
            />
            {t(
              "tts.TtsModelListPage.exploreModal.exploreModalOpenButton"
            )}
          </button>
        </div>
      </div>
    </>
  )
}
