import { animationFilter, animationItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";

export const AnimationTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (animationFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (animationFilter.value = AssetFilterOption.MINE)}
            disabled={!animationItems.value.some((item) => item.isMine)}
          >
            My Animations
          </button>
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
              "disabled",
            )}
            onClick={() =>
              (animationFilter.value = AssetFilterOption.BOOKMARKED)
            }
            disabled={!animationItems.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4 pb-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium"
        >
          Upload Animation
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements
          items={animationItems.value}
          assetFilter={animationFilter.value}
        />
      </div>
    </>
  );
};
