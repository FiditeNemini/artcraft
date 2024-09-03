// import { useSignals } from "@preact/signals-react/runtime";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faBars,
  faDownload,
  faFloppyDisk,
  faFilePlus,
  faHand,
  faLocationArrow,
  faPlus,
  faMinus,
  faSquareDashed,
} from "@fortawesome/pro-thin-svg-icons";

import { ToolbarButtons } from "./ToolbarButtons";

// import { layout } from "~/signals";

export const ToolbarMain = () => {
  // useSignals();
  // const {
  //   signals: { isMobile, windowWidth, windowHeight },
  // } = layout;
  return (
    <div className="col-span-12 col-start-1 row-span-1 row-start-12 justify-center">
      <div className="m-auto flex w-fit items-center divide-x divide-ui-border rounded-2xl border border-ui-border bg-ui-panel p-2">
        {/* <p>
          Layout is {windowWidth.value} x {windowHeight.value},{" "}
          <b>{isMobile.value ? "Mobile" : "Not Mobile"}</b>
        </p> */}
        <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faBars} />
          <ToolbarButtons
            icon={faLocationArrow}
            iconProps={{ className: "fa-flip-horizontal" }}
          />
          <ToolbarButtons icon={faSquareDashed} />
          <ToolbarButtons icon={faFilePlus} />
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faMinus} />
          <span>100%</span>
          <ToolbarButtons icon={faPlus} />
          <ToolbarButtons icon={faHand} />
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faArrowRotateLeft} />
          <ToolbarButtons icon={faArrowRotateRight} />
          <ToolbarButtons icon={faFloppyDisk} />
          <ToolbarButtons icon={faDownload} />
        </div>
      </div>
    </div>
  );
};
