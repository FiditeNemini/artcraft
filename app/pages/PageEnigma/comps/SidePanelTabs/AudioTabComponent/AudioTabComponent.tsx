import { useContext } from "react";
import { twMerge } from "tailwind-merge";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import { AppUiContext } from "~/pages/PageEnigma/contexts/AppUiContext";
import { APPUI_ACTION_TYPES } from "~/pages/PageEnigma/reducers";
import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";

import { Button } from "~/components";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";




export const AudioTabComponent = () => {
  useSignals();
  const [, dispatchAppUiState] = useContext(AppUiContext);
  const handleOpenTtsDialogue = ()=>{
      dispatchAppUiState({
      type: APPUI_ACTION_TYPES.OPEN_DIALOGUE_TTS
    })
  }
  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.MINE)}
            disabled={!audioItems.value.some((item) => item.isMine)}
          >
            My Audios
          </button>
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!audioItems.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium"
          onClick={handleOpenTtsDialogue}
        >
          Generate Audio
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4 pt-4">
        <ItemElements
          items={audioItems.value}
          assetFilter={audioFilter.value}
        />
      </div>
    </>
  );
};