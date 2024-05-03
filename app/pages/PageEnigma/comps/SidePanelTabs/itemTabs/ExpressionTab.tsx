import { expressionFilter, expressionItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";

export const ExpressionTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              expressionFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (expressionFilter.value = AssetFilterOption.ALL)}>
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              expressionFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
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
              "disabled",
            )}
            onClick={() =>
              (expressionFilter.value = AssetFilterOption.BOOKMARKED)
            }
            disabled={!expressionItems.value.some((item) => item.isBookmarked)}>
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4 pb-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium">
          Upload Expression
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements
          items={expressionItems.value}
          assetFilter={expressionFilter.value}
        />
      </div>
    </>
  );
};
