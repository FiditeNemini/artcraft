import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";
import {
  dndSidePanelWidth,
  lastSelectedTab,
  selectedTab,
  sidePanelHeight,
  sidePanelVisible,
  sidePanelWidth,
} from "~/pages/PageEnigma/store";
import { SidePanelTabs } from "~/pages/PageEnigma/comps/SidePanelTabs";
import { SidePanelMenu } from "~/pages/PageEnigma/comps/SidePanelTabs/SidePanelMenu";
import { useSignals } from "@preact/signals-react/runtime";

export const SidePanel = () => {
  useSignals();

  const displayWidth =
    dndSidePanelWidth.value > -1
      ? dndSidePanelWidth.value
      : sidePanelWidth.value;

  return (
    <>
      <div
        className={[
          "fixed",
          "border-l border-l-ui-panel-border bg-ui-panel",
          "flex",
          "transition-all duration-300 ease-in-out",
        ].join(" ")}
        style={{
          top: 68,
          right: 84,
          width: sidePanelVisible.value ? displayWidth : 0,
        }}
      >
        <button
          onClick={() => {
            if (sidePanelVisible.value) {
              lastSelectedTab.value = selectedTab.value;
              selectedTab.value = null;
              sidePanelVisible.value = false;
            } else {
              selectedTab.value = lastSelectedTab.value;
              sidePanelVisible.value = true;
            }
          }}
          className="absolute left-[-25px] flex rounded-l-lg bg-ui-controls px-2 py-3 align-middle text-sm text-white hover:bg-ui-controls-button"
          style={{ top: sidePanelHeight.value / 2 - 10 }}
        >
          <FontAwesomeIcon
            icon={sidePanelVisible.value ? faChevronRight : faChevronLeft}
          />
        </button>
        <div className="relative block h-full w-full bg-ui-panel">
          <SidePanelTabs />
        </div>
      </div>
      <SidePanelMenu />
    </>
  );
};
