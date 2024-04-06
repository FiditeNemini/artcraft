import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  selectedTab,
  sidePanelHeight,
} from "~/pages/PageEnigma/store/sidePanel";
import { tabList } from "./tabList";

export const SidePanelMenu = () => {
  useSignals();

  useEffect(() => {
    selectedTab.value = tabList[0];
  }, []);

  return (
    <div
      className={["bg-assets-background", "px-2 py-4", "overflow-y-auto"].join(
        " ",
      )}
      style={{ height: sidePanelHeight.value, width: 84 }}
    >
      <div className="flex w-full flex-col gap-2">
        {tabList.map((tab) => (
          <button
            key={tab.value}
            className={[
              "flex flex-col items-center rounded-lg px-2 py-3",
              tab.value === selectedTab?.value?.value
                ? "bg-assets-selectedTab"
                : "",
            ].join(" ")}
            onClick={() => (selectedTab.value = tab)}
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
