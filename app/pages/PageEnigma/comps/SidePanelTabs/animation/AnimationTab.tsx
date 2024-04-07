import { useState } from "react";
import { AnimationElements } from "~/pages/PageEnigma/comps/SidePanelTabs/animation/AnimationElements";
import { dndSidePanelWidth, sidePanelWidth } from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

export const AnimationTab = () => {
  useSignals();
  const [selectedButton, setSelectedButton] = useState("all");

  const displayWidth =
    dndSidePanelWidth.value > -1
      ? dndSidePanelWidth.value
      : sidePanelWidth.value;

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
            My Animations
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
          Upload Animation
        </button>
      </div>
      <div className="overflow-y-auto px-2 pt-2">
        <AnimationElements />
      </div>
    </>
  );
};
