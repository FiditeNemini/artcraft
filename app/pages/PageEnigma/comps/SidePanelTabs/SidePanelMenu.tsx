import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  lastSelectedTab,
  selectedTab,
  sidePanelHeight,
  sidePanelVisible,
} from "~/pages/PageEnigma/store/sidePanel";
import { tabList } from "./tabList";

export const SidePanelMenu = () => {
  useSignals();

  useEffect(() => {
    selectedTab.value = tabList[0];
  }, []);

  return (
    <div
      className={[
        "bg-assets-background fixed",
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
            className={[
              "flex flex-col items-center rounded-lg px-2 py-3",
              tab.value === selectedTab?.value?.value
                ? "bg-assets-selectedTab opacity-100"
                : "opacity-50",
            ].join(" ")}
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
