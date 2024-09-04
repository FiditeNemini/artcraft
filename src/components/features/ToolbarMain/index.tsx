import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";
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

import { ToolbarButtons } from "../ToolbarButtons";
import { twMerge } from "tailwind-merge";

import { UploadImage } from "../UploadImage";

// style constants
import { paperWrapperStyles } from "~/components/styles";

// for testing
import { layout } from "~/signals";

export const ToolbarMain = () => {
  //// for testing
  useSignals();
  const {
    signals: { isMobile },
  } = layout;
  useSignalEffect(() => {
    console.info(
      "orientation Changed",
      `Oriendtation Change detected, current orientation: ${isMobile.value ? "mobile" : "desktop"}`,
    );
  });
  /// end for testing

  const [isUploadSubmenuOpen, setIsUploadSubmenuOpen] = useState(false);
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);

  return (
    <div className="col-span-12 col-start-1 row-span-1 row-start-12 justify-center">
      <div
        className={twMerge(
          "m-auto flex w-fit items-center divide-x divide-ui-border",
          paperWrapperStyles,
        )}
      >
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
                  paperWrapperStyles,
                )}
              >
                <ToolbarButtons
                  icon={faImage}
                  onClick={() => setIsUploadImageOpen(true)}
                />
                <ToolbarButtons icon={faFilm} />
              </div>
            )}
          </div>
          <ToolbarButtons icon={faCameraRotate} />
        </div>
        {/* <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faMinus} />
          <span>100%</span>
          <ToolbarButtons icon={faPlus} />
          <ToolbarButtons icon={faHand} />
        </div> */}
        <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faArrowRotateLeft} />
          <ToolbarButtons icon={faArrowRotateRight} />
          <ToolbarButtons icon={faFloppyDisk} />
          <ToolbarButtons icon={faDownload} />
        </div>
      </div>

      <UploadImage
        isOpen={isUploadImageOpen}
        closeCallback={() => setIsUploadImageOpen(false)}
      />
    </div>
  );
};
