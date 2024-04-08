import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import {
  filterTabBase,
  filterTabActive,
  filterTabDisabled,
} from "./filterTabsClasses";

export const AudioTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              filterTabBase,
              audioFilter.value === AssetFilterOption.ALL
                ? filterTabActive
                : "",
              filterTabDisabled,
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              filterTabBase,
              audioFilter.value === AssetFilterOption.MINE
                ? filterTabActive
                : "",
              filterTabDisabled,
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.MINE)}
            disabled={!audioItems.value.some((item) => item.isMine)}
          >
            My Audios
          </button>
          <button
            className={twMerge(
              filterTabBase,
              audioFilter.value === AssetFilterOption.BOOKMARKED
                ? filterTabActive
                : "",
              filterTabDisabled,
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
