// import { useSignals } from "@preact/signals-react/runtime";
import { useState } from "react";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faBars,
  faCameraRotate,
  faDownload,
  faFilePlus,
  faFilm,
  faFloppyDisk,
  faHand,
  faImage,
  faLocationArrow,
  faPlus,
  faMinus,
  faSquareDashed,
} from "@fortawesome/pro-thin-svg-icons";

import { ToolbarButtons } from "./ToolbarButtons";
import { twMerge } from "tailwind-merge";

// import { layout } from "~/signals";

export const ToolbarMain = () => {
  // useSignals();
  // const {
  //   signals: { isMobile, windowWidth, windowHeight },
  // } = layout;
  const [isUploadSubmenuOpen, setIsUploadSubmenuOpen] = useState(false);
  const panelClasses =
    "rounded-2xl border border-ui-border bg-ui-panel p-2 shadow-xl";
  return (
    <div className="col-span-12 col-start-1 row-span-1 row-start-12 justify-center">
      <div
        className={twMerge(
          "m-auto flex w-fit items-center divide-x divide-ui-border",
          panelClasses,
        )}
      >
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
          <div className="relative">
            <ToolbarButtons
              icon={faFilePlus}
              onClick={() => {
                setIsUploadSubmenuOpen(true);
              }}
            />
            {isUploadSubmenuOpen && (
              <div
                className={twMerge(
                  "absolute -left-2 bottom-11 z-10",
                  panelClasses,
                )}
              >
                <ToolbarButtons icon={faImage} />
                <ToolbarButtons icon={faFilm} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faMinus} />
          <span>100%</span>
          <ToolbarButtons icon={faPlus} />
          <ToolbarButtons icon={faHand} />
          <ToolbarButtons icon={faCameraRotate} />
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
