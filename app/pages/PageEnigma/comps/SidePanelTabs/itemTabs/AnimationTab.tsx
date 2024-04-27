import { animationFilter, animationItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

export const AnimationTab = () => {
  useSignals();

  return (
    <>
      <TabTitle title="Animation" />
      <div className="w-full h-48 overflow-x-auto px-4 flex items-center justify-start gap-2">
        <button
          className={twMerge(
            "filter-tab",
            animationFilter.value === AssetFilterOption.ALL ? "active" : "",
          )}
          onClick={() => (animationFilter.value = AssetFilterOption.ALL)}>
          All
        </button>
        <button
          className={twMerge(
            "filter-tab",
            animationFilter.value === AssetFilterOption.MINE ? "active" : "",
          )}
          onClick={() => (animationFilter.value = AssetFilterOption.MINE)}
          disabled={!animationItems.value.some((item) => item.isMine)}>
          My Animations
        </button>
        <button
          className={twMerge(
            "filter-tab",
            animationFilter.value === AssetFilterOption.BOOKMARKED
              ? "active"
              : "",
          )}
          onClick={() =>
            (animationFilter.value = AssetFilterOption.BOOKMARKED)
          }
          disabled={!animationItems.value.some((item) => item.isBookmarked)}>
          Bookmarked
        </button>
      </div>
      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium">
          Upload Animation
        </Button>
      </div>
      <div className="grow flex w-full overflow-y-auto px-4 pb-4">
        <ItemElements
          items={animationItems.value}
          assetFilter={animationFilter.value}
        />
      </div>
    </>
  );
};
