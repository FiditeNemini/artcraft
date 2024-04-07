import { AssetFilterOption, AssetType } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import {
  characterFilter,
  characterItems,
  objectFilter,
  objectItems,
} from "~/pages/PageEnigma/store";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";

interface Props {
  type: AssetType;
}

export const ObjectsTab = ({ type }: Props) => {
  useSignals();

  const assetFilter =
    type === AssetType.CHARACTER ? characterFilter : objectFilter;

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              assetFilter.value === AssetFilterOption.ALL
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (assetFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={[
              "bg-assets-background text-nowrap rounded-lg px-3 py-1 text-sm",
              assetFilter.value === AssetFilterOption.MINE
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (assetFilter.value = AssetFilterOption.MINE)}
          >
            My {type === AssetType.CHARACTER ? "Characters" : "Objects"}
          </button>
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              assetFilter.value === AssetFilterOption.BOOKMARKED
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (assetFilter.value = AssetFilterOption.BOOKMARKED)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="px-2">
        <button className="bg-assets-background w-full rounded-lg py-2">
          Upload {type === AssetType.CHARACTER ? "Character" : "Object"}
        </button>
      </div>
      <div className="mt-2 overflow-y-auto px-2 pt-2">
        <ItemElements
          items={
            type === AssetType.CHARACTER
              ? characterItems.value
              : objectItems.value
          }
          assetFilter={
            type === AssetType.CHARACTER
              ? characterFilter.value
              : objectFilter.value
          }
        />
      </div>
    </>
  );
};
