// import { useSignals } from "@preact/signals-react/runtime";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faBars,
  faDownload,
  faFloppyDisk,
  faLocationArrow,
  faPlusLarge,
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
      <div className="m-auto flex w-fit items-center justify-center gap-2 rounded-2xl border border-ui-border bg-ui-panel p-2">
        {/* <p>
          Layout is {windowWidth.value} x {windowHeight.value},{" "}
          <b>{isMobile.value ? "Mobile" : "Not Mobile"}</b>
        </p> */}
        <ToolbarButtons icon={faBars} />
        <ToolbarButtons
          icon={faLocationArrow}
          iconProps={{ className: "fa-flip-horizontal" }}
        />
        <ToolbarButtons icon={faSquareDashed} />
        <ToolbarButtons icon={faPlusLarge} />
        <ToolbarButtons icon={faArrowRotateLeft} />
        <ToolbarButtons icon={faArrowRotateRight} />
        <ToolbarButtons icon={faFloppyDisk} />
        <ToolbarButtons icon={faDownload} />
      </div>
    </div>
  );
};
