import { AssetFilterOption, AssetType } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import {
  characterFilter,
  characterItems,
  objectFilter,
  objectItems,
} from "~/pages/PageEnigma/store";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { shapeItems } from "~/pages/PageEnigma/store";

interface Props {
  type: AssetType;
}

export const ObjectsTab = ({ type }: Props) => {
  useSignals();

  const assetFilter =
    type === AssetType.CHARACTER ? characterFilter : objectFilter;
  const items = type === AssetType.CHARACTER ? characterItems : objectItems;

  return (
    <>
      <div className="w-full overflow-x-auto p-4 pb-0">
        <TabTitle
          title={type === AssetType.CHARACTER ? "Characters" : "Objects"}
        />
        <div className="mb-4 flex justify-start gap-2">
          <button
            className={twMerge(
              "filter-tab",
              assetFilter.value === AssetFilterOption.ALL ? "active" : "",
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.ALL)}>
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              assetFilter.value === AssetFilterOption.MINE ? "active" : "",
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.MINE)}
            disabled={!items.value.some((item) => item.isMine)}>
            My {type === AssetType.CHARACTER ? "Characters" : "Objects"}
          </button>
          <button
            className={twMerge(
              "filter-tab",
              assetFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!items.value.some((item) => item.isBookmarked)}>
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4 pb-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium">
          Upload {type === AssetType.CHARACTER ? "Character" : "Object"}
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements items={[ ...type !== AssetType.CHARACTER ? shapeItems.value : [], ...items.value ]} assetFilter={assetFilter.value} />
      </div>
    </>
  );
};
