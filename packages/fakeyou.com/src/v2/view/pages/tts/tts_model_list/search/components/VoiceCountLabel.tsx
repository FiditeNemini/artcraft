import React from "react";
import { Trans } from "react-i18next";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "../../../../../../../AppWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle } from "@fortawesome/pro-light-svg-icons";
import { Analytics } from "../../../../../../../common/Analytics";
import { GetRandomArrayValue } from "@storyteller/components/src/utils/GetRandomArrayValue";

interface Props {
  allTtsModels: TtsModelListItem[];
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;
  selectedCategories: TtsCategoryType[];
  selectedTtsLanguageScope: string;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;
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

  let possibleVoices = leafiestCategoryModels
    .filter((ttsModel) => {
      // Scope to currently selected language
      if (props.selectedTtsLanguageScope === "*") {
        return true; // NB: Sentinel value of "*" means all languages.
      }
      return (
        ttsModel.ietf_primary_language_subtag === props.selectedTtsLanguageScope
      );
    });

  const selectRandomVoice = () => {
    // TODO: Prefer to select a random *good* voice or *popular* voice.
    const randomVoice = GetRandomArrayValue(possibleVoices);
    if (randomVoice !== undefined) {
      props.setMaybeSelectedTtsModel(randomVoice);
    }
  }

  const voiceCount = possibleVoices.length;

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
        <button
          onClick={() => {
            Analytics.ttsClickRandomVoice();
            selectRandomVoice();
          }}
          className="btn btn-link btn-small pt-0 ps-0"
          type="button"
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>
      </div>
    </>
  );
}
