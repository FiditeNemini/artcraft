import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";

export const AudioTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              audioFilter.value === AssetFilterOption.ALL
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (audioFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={[
              "bg-assets-background text-nowrap rounded-lg px-3 py-1 text-sm",
              audioFilter.value === AssetFilterOption.MINE
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (audioFilter.value = AssetFilterOption.MINE)}
          >
            My Audios
          </button>
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              audioFilter.value === AssetFilterOption.BOOKMARKED
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (audioFilter.value = AssetFilterOption.BOOKMARKED)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="px-2">
        <button className="bg-assets-background w-full rounded-lg py-2">
          Upload Audio
        </button>
      </div>
      <div className="overflow-y-auto px-2 pt-2">
        <ItemElements
          items={audioItems.value}
          assetFilter={audioFilter.value}
        />
      </div>
    </>
  );
};
