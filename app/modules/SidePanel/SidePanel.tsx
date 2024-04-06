import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";
import { dndWidth, sidePanelWidth } from "~/pages/PageEnigma/store";
import { SidePanelTabs } from "~/pages/PageEnigma/comps/SidePanelTabs";
import { SidePanelMenu } from "~/pages/PageEnigma/comps/SidePanelTabs/SidePanelMenu";
import { useSignals } from "@preact/signals-react/runtime";

export const SidePanel = () => {
  useSignals();
  const [isVisible, setIsVisible] = useState(true);

  const displayWidth =
    dndWidth.value > -1 ? dndWidth.value : sidePanelWidth.value;

  return (
    <div
      className={[
        "relative h-full",
        "border-l border-l-ui-panel-border bg-ui-panel",
        "flex",
      ].join(" ")}
      style={{ width: isVisible ? displayWidth + 84 : 84 }}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute left-[-25px] top-1/2 flex rounded-l-lg bg-ui-controls px-2 py-3 align-middle text-sm text-white hover:bg-ui-controls-button"
      >
        <FontAwesomeIcon icon={isVisible ? faChevronRight : faChevronLeft} />
      </button>
      <div className="relative h-full w-full transition-all duration-300 ease-in-out">
        {isVisible && <SidePanelTabs />}
      </div>
      <SidePanelMenu />
    </div>
  );
};
