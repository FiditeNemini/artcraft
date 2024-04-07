import { animationFilter, animationItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";

export const AnimationTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              animationFilter.value === AssetFilterOption.ALL
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (animationFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={[
              "bg-assets-background text-nowrap rounded-lg px-3 py-1 text-sm",
              "disabled:text-gray-500",
              animationFilter.value === AssetFilterOption.MINE
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (animationFilter.value = AssetFilterOption.MINE)}
            disabled={!animationItems.value.some((item) => item.isMine)}
          >
            My Animations
          </button>
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              "disabled:text-gray-500",
              animationFilter.value === AssetFilterOption.BOOKMARKED
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() =>
              (animationFilter.value = AssetFilterOption.BOOKMARKED)
            }
            disabled={!animationItems.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-2">
        <button className="bg-assets-background w-full rounded-lg py-2">
          Upload Animation
        </button>
      </div>
      <div className="w-full overflow-y-auto px-2 pt-2">
        <ItemElements
          items={animationItems.value}
          assetFilter={animationFilter.value}
        />
      </div>
    </>
  );
};
