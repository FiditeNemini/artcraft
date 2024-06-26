import {
  dndSidePanelWidth,
  sidePanelVisible,
  sidePanelWidth,
} from "~/pages/PageEnigma/signals";
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
          "z-20 border-l border-l-ui-panel-border bg-ui-panel",
          "flex",
          "transition-all duration-300 ease-in-out",
        ].join(" ")}
        style={{
          top: 64,
          right: 84,
          width: sidePanelVisible.value ? displayWidth : 0,
        }}
      >
        <div className="relative block h-full w-full bg-ui-panel">
          <SidePanelTabs />
        </div>
      </div>
      <SidePanelMenu />
    </>
  );
};
