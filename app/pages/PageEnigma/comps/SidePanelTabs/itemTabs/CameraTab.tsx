import { cameraFilter, cameraItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";

export const CameraTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              cameraFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (cameraFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              cameraFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (cameraFilter.value = AssetFilterOption.MINE)}
            disabled={!cameraItems.value.some((item) => item.isMine)}
          >
            My Cameras
          </button>
          <button
            className={twMerge(
              "filter-tab",
              cameraFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
              "disabled",
            )}
            onClick={() => (cameraFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!cameraItems.value.some((item) => item.isBookmarked)}
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
          Create Camera Movement
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4 pt-4">
        <ItemElements
          items={cameraItems.value}
          assetFilter={cameraFilter.value}
        />
      </div>
    </>
  );
};
