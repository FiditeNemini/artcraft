import { AssetType } from "~/pages/PageEnigma/models";
import { useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { timelineHeight } from "~/pages/PageEnigma/store";

const TABS = [
  {
    icon: "resources/icons/animations.png",
    title: "Animation",
    value: AssetType.ANIMATION,
  },
  {
    icon: "resources/icons/objects.png",
    title: "Objects",
    value: AssetType.OBJECT,
  },
  {
    icon: "resources/icons/characters.png",
    title: "Characters",
    value: AssetType.CHARACTER,
  },
  {
    icon: "resources/icons/camera.png",
    title: "Camera",
    value: AssetType.CAMERA,
  },
  {
    icon: "resources/icons/audios.png",
    title: "Audio",
    value: AssetType.AUDIO,
  },
];

export const SidePanelTabs = () => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);
  useSignals();
  const [height, setHeight] = useState(0);
  const [selectedButton, setSelectedButton] = useState("all");

  useEffect(() => {
    setHeight(window.innerHeight - timelineHeight.value - 68);
    console.log(
      window.outerHeight - timelineHeight.value - 68,
      window.outerHeight,
      timelineHeight.value,
    );
  }, [timelineHeight.value]);

  return (
    <div>
      <div className="flex h-full">
        <div
          className="flex w-full flex-col justify-start"
          style={{ height, width: "calc(100% - 80px)" }}
        >
          <div className="w-full overflow-x-auto">
            <div style={{ width: 300 }}>
              <div className="mb-4 mt-2 flex justify-start gap-2 px-2">
                <button
                  className={[
                    "bg-assets-background rounded-lg px-3 py-1 text-sm",
                    selectedButton === "all"
                      ? "border-2 border-brand-primary"
                      : "",
                  ].join(" ")}
                  onClick={() => setSelectedButton("all")}
                >
                  All
                </button>
                <button
                  className={[
                    "bg-assets-background rounded-lg px-3 py-1 text-sm",
                    selectedButton === "mine"
                      ? "border-2 border-brand-primary"
                      : "",
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
          </div>
          <div className="px-2">
            <button className="bg-assets-background w-full rounded-lg py-2">
              Upload Animation
            </button>
          </div>
          <div className="flex flex-wrap gap-3 px-2"></div>
        </div>
        <div
          className={[
            "bg-assets-background",
            "mr-2 px-2 py-4",
            "overflow-y-auto",
          ].join(" ")}
          style={{ height, minWidth: 80 }}
        >
          <div className="flex w-full flex-col gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                className={[
                  "flex flex-col items-center rounded-lg px-2 py-3",
                  tab.value === selectedTab ? "bg-assets-selectedTab" : "",
                ].join(" ")}
                onClick={() => setSelectedTab(tab.value)}
              >
                <div>
                  <img src={tab.icon} alt={tab.title} width={20} height={20} />
                </div>
                <div className="" style={{ fontSize: 11 }}>
                  {tab.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
