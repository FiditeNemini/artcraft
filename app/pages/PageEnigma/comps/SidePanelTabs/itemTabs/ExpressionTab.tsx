import { expressionFilter, expressionItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { TabTitle } from "../comps/TabTitle";

export const ExpressionTab = () => {
  useSignals();

  return (
    <>
      <TabTitle title="Expressions" />

      <div>
        <div>
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-4">
            <button
              className={twMerge(
                "filter-tab",
                expressionFilter.value === AssetFilterOption.ALL
                  ? "active"
                  : "",
              )}
              onClick={() => (expressionFilter.value = AssetFilterOption.ALL)}>
              All
            </button>
            <button
              className={twMerge(
                "filter-tab",
                expressionFilter.value === AssetFilterOption.MINE
                  ? "active"
                  : "",
              )}
              onClick={() => (expressionFilter.value = AssetFilterOption.MINE)}
              disabled={!expressionItems.value.some((item) => item.isMine)}>
              My Expressions
            </button>
            <button
              className={twMerge(
                "filter-tab",
                expressionFilter.value === AssetFilterOption.BOOKMARKED
                  ? "active"
                  : "",
              )}
              onClick={() =>
                (expressionFilter.value = AssetFilterOption.BOOKMARKED)
              }
              disabled={
                !expressionItems.value.some((item) => item.isBookmarked)
              }>
              Bookmarked
            </button>
          </div>
        </div>
      </div>
      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium">
          Upload Expression
        </Button>
      </div>
      <div className="h-full grow overflow-y-auto px-4">
        <ItemElements
          items={expressionItems.value}
          assetFilter={expressionFilter.value}
        />
      </div>
    </>
  );
};
