import { useSignals } from "@preact/signals-react/runtime";
import {
  dndWidth,
  selectedTab,
  sidePanelHeight,
  sidePanelWidth,
} from "~/pages/PageEnigma/store";
import { tabList } from "~/pages/PageEnigma/comps/SidePanelTabs/tabList";
import { useMouseEventsSidePanel } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsSidePanel";

export const SidePanelTabs = () => {
  useSignals();
  const { onPointerDown } = useMouseEventsSidePanel();

  const displayWidth =
    dndWidth.value > -1 ? dndWidth.value : sidePanelWidth.value;

  return (
    <>
      <div style={{ height: sidePanelHeight.value, width: displayWidth }}>
        {tabList.map((tab) => (
          <div
            key={tab.value}
            className={tab.value === selectedTab.value?.value ? "" : "hidden"}
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
