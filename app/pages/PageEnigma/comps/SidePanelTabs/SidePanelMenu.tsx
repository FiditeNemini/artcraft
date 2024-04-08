import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  lastSelectedTab,
  selectedTab,
  sidePanelHeight,
  sidePanelVisible,
} from "~/pages/PageEnigma/store/sidePanel";
import { tabList } from "./tabList";
import { twMerge } from "tailwind-merge";

export const SidePanelMenu = () => {
  useSignals();

  useEffect(() => {
    selectedTab.value = tabList[0];
  }, []);

  return (
    <div
      className={[
        "fixed bg-assets-background",
        "px-2 py-4",
        "overflow-y-auto",
      ].join(" ")}
      style={{
        height: sidePanelHeight.value,
        minWidth: 84,
        maxWidth: 84,
        right: 0,
        top: 70,
      }}
    >
      <div className="flex w-full flex-col gap-2">
        {tabList.map((tab) => (
          <button
            key={tab.value}
            className={twMerge(
              "flex flex-col items-center gap-2 rounded-lg px-2 py-2.5 transition-all duration-150 hover:bg-assets-selectedTab/80",
              tab.value === selectedTab?.value?.value
                ? "bg-assets-selectedTab opacity-100 hover:bg-assets-selectedTab"
                : "opacity-50",
            )}
            onClick={() => {
              selectedTab.value = tab;
              if (!sidePanelVisible.value) {
                sidePanelVisible.value = true;
              }
            }}
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
  );
};
