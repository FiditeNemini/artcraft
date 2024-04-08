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
import {
  filterTabBase,
  filterTabActive,
  filterTabDisabled,
} from "./filterTabsClasses";

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
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              filterTabBase,
              assetFilter.value === AssetFilterOption.ALL
                ? filterTabActive
                : "",
              filterTabDisabled,
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              filterTabBase,
              assetFilter.value === AssetFilterOption.MINE
                ? filterTabActive
                : "",
              filterTabDisabled,
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.MINE)}
            disabled={!items.value.some((item) => item.isMine)}
          >
            My {type === AssetType.CHARACTER ? "Characters" : "Objects"}
          </button>
          <button
            className={twMerge(
              filterTabBase,
              assetFilter.value === AssetFilterOption.BOOKMARKED
                ? filterTabActive
                : "",
              filterTabDisabled,
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!items.value.some((item) => item.isBookmarked)}
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
          Upload {type === AssetType.CHARACTER ? "Character" : "Object"}
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4 pt-4">
        <ItemElements items={items.value} assetFilter={assetFilter.value} />
      </div>
    </>
  );
};
