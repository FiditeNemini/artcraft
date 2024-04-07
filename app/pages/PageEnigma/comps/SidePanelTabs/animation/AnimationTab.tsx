import { useState } from "react";
import { AnimationElements } from "~/pages/PageEnigma/comps/SidePanelTabs/animation/AnimationElements";

export const AnimationTab = () => {
  const [selectedButton, setSelectedButton] = useState("all");

  return (
    <>
      <div className="w-full overflow-x-auto">
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
      <div className="w-full px-2">
        <button className="bg-assets-background w-full rounded-lg py-2">
          Upload Animation
        </button>
      </div>
      <div className="w-full overflow-y-auto px-2 pt-2">
        <AnimationElements />
      </div>
    </>
  );
};
