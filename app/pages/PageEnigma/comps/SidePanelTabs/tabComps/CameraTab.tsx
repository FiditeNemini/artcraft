import { cameraFilter, cameraItems } from "~/pages/PageEnigma/signals";
import { useSignals } from "@preact/signals-react/runtime";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import {
  ItemElements,
  TabTitle,
} from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { AssetFilterOption } from "~/enums";

export const CameraTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto p-4 pb-0">
        <TabTitle title="Camera" />
        <div className="mb-4 flex justify-start gap-2">
          <button
            className={twMerge(
              "filter-tab",
              cameraFilter.value === AssetFilterOption.ALL ? "active" : "",
            )}
            onClick={() => (cameraFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              cameraFilter.value === AssetFilterOption.MINE ? "active" : "",
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
            )}
            onClick={() => (cameraFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!cameraItems.value.some((item) => item.isBookmarked)}
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
          Create Camera Movement
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements items={cameraItems.value} />
      </div>
    </>
  );
};
