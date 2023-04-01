import React from "react";
import { TtsCategoryType } from "../../../../../../AppWrapper";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { ScopedVoiceModelOptions } from "./components/ScopedVoiceModelOptions";
import { VoiceCountLabel } from "./components/VoiceCountLabel";

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
  return (
    <>
      <div className="pb-4">
        <VoiceCountLabel
          allTtsModels={props.allTtsModels}
          ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
          selectedCategories={props.selectedCategories}
          selectedTtsLanguageScope={props.selectedTtsLanguageScope}
          setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
        />

        <div className="d-flex flex-column flex-lg-row gap-3">
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
