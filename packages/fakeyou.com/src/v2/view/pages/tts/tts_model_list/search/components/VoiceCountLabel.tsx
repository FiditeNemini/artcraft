import React from "react";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../../../AppWrapper";
import { Trans } from "react-i18next";

interface Props {
  allTtsModels: TtsModelListItem[];
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;
  selectedCategories: TtsCategoryType[];
  selectedTtsLanguageScope: string;
}

// NB/TODO: This duplicates the work of a sister component, but it was the fastest way
// to hack this in without passing callbacks around or moving calculation higher up the 
// component tree.

export function VoiceCountLabel(props: Props) {
  const {
    allTtsModels,
    ttsModelsByCategoryToken,
    selectedCategories,
  } = props;

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
      return true; // NB: We're only counting voices.
    });


  const voiceCount = options.length;

  return (
    <>
      <div className="d-flex gap-2">
        <label className="sub-title">
          <Trans
            i18nKey="tts.TtsModelListPage.form.voicesLabel"
            count={voiceCount}
          >
            Voice ({voiceCount} to choose from)
          </Trans>
        </label>

        {/*<a href="/" className="ms-1">
          <FontAwesomeIcon icon={faShuffle} />
        </a>*/}
      </div>
    </>
  );
}
