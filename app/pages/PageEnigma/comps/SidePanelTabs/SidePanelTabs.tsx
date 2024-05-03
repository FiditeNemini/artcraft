import { useSignals } from "@preact/signals-react/runtime";
import { selectedTab, sidePanelHeight } from "~/pages/PageEnigma/store";
import {
  TabItem,
  tabList,
} from "~/pages/PageEnigma/comps/SidePanelTabs/tabList";
import { useMouseEventsSidePanel } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsSidePanel";
import { useLayoutEffect, useState } from "react";
import { environmentVariables } from "~/store";

export const SidePanelTabs = () => {
  useSignals();
  const { onPointerDown } = useMouseEventsSidePanel();
  const [tabs, setTabs] = useState<TabItem[]>();
  useLayoutEffect(() => {
    setTabs(tabList(environmentVariables.value));
  }, []);

  return (
    <>
      <div style={{ height: sidePanelHeight.value, width: "100%" }}>
        {(tabs ?? []).map((tab) => (
          <div
            key={tab.value}
            className={
              tab.value === selectedTab.value?.value
                ? "flex h-full flex-col gap-3.5 overflow-y-auto"
                : "hidden"
            }>
            {tab.component}
          </div>
        ))}
      </div>
      <div
        className="absolute inset-0 block w-1 cursor-ew-resize"
        style={{ height: sidePanelHeight.value }}
        onPointerDown={onPointerDown}
      />
    </>
  );
};
