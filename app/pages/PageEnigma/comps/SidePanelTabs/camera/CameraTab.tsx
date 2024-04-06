import { useState } from "react";
import { AssetType } from "~/pages/PageEnigma/models";
import { ObjectElements } from "~/pages/PageEnigma/comps/SidePanelTabs/objects/ObjectElements";
import {
  dndWidth,
  pageHeight,
  sidePanelWidth,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { CameraElements } from "~/pages/PageEnigma/comps/SidePanelTabs/camera/CameraElements";

export const CameraTab = () => {
  useSignals();
  const height = pageHeight.value - timelineHeight.value;
  const [selectedButton, setSelectedButton] = useState("all");

  const displayWidth =
    dndWidth.value > -1 ? dndWidth.value : sidePanelWidth.value;

  return (
    <>
      <div className="overflow-x-auto" style={{ width: displayWidth }}>
        <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              selectedButton === "all" ? "border-2 border-brand-primary" : "",
            ].join(" ")}
            onClick={() => setSelectedButton("all")}
          >
            All
          </button>
          <button
            className={[
              "bg-assets-background text-nowrap rounded-lg px-3 py-1 text-sm",
              selectedButton === "mine" ? "border-2 border-brand-primary" : "",
            ].join(" ")}
            onClick={() => setSelectedButton("mine")}
          >
            My Cameras
          </button>
          <button
            className={[
              "bg-assets-background rounded-lg px-3 py-1 text-sm",
              selectedButton === "bookmarked"
                ? "border-2 border-brand-primary"
                : "",
            ].join(" ")}
            onClick={() => setSelectedButton("bookmarked")}
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
      <div
        className="mt-2 overflow-y-auto px-2 pt-2"
        style={{ height: height - 140 }}
      >
        <CameraElements />
      </div>
    </>
  );
};
