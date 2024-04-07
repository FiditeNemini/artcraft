import { cameraFilter, cameraItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";

export const CameraTab = () => {
  useSignals();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              cameraFilter.value === AssetFilterOption.ALL
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (cameraFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={[
              "bg-assets-background text-nowrap rounded-lg px-3 py-1 text-sm",
              "disabled:text-gray-500",
              cameraFilter.value === AssetFilterOption.MINE
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (cameraFilter.value = AssetFilterOption.MINE)}
            disabled={!cameraItems.value.some((item) => item.isMine)}
          >
            My Cameras
          </button>
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              "disabled:text-gray-500",
              cameraFilter.value === AssetFilterOption.BOOKMARKED
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => (cameraFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!cameraItems.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="px-2">
        <button className="bg-assets-background w-full rounded-lg py-2">
          Create Camera
        </button>
      </div>
      <div className="mt-2 overflow-y-auto px-2 pt-2">
        <ItemElements
          items={cameraItems.value}
          assetFilter={cameraFilter.value}
        />
      </div>
    </>
  );
};
