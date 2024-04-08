import { useSignals } from "@preact/signals-react/runtime";
import {
  // dndSidePanelWidth,
  selectedTab,
  sidePanelHeight,
  // sidePanelWidth,
} from "~/pages/PageEnigma/store";
import { tabList } from "~/pages/PageEnigma/comps/SidePanelTabs/tabList";
import { useMouseEventsSidePanel } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsSidePanel";

export const SidePanelTabs = () => {
  useSignals();
  const { onPointerDown } = useMouseEventsSidePanel();

  return (
    <>
      <div style={{ height: sidePanelHeight.value, width: "100%" }}>
        {tabList.map((tab) => (
          <div
            key={tab.value}
            className={
              tab.value === selectedTab.value?.value ? "h-full" : "hidden"
            }
          >
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
