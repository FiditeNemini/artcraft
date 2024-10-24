import { Fragment, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faBars,
  // faCameraRotate,
  // faDownload,
  faCloudArrowDown,
  faFilePlus,
  faFilm,
  faFloppyDisk,
  faHatWizard,
  faImage,
  faLocationArrow,
  faText,
} from "@fortawesome/pro-solid-svg-icons";

import { ToolbarButton } from "../ToolbarButton";

// style and constants
import { paperWrapperStyles, toolTipStyles } from "~/components/styles";
import { ToolbarMainButtonNames } from "./enum";

export const ToolbarMain = ({
  disabled = false,
  buttonProps,
}: {
  disabled?: boolean;
  buttonProps: {
    [key in ToolbarMainButtonNames]: {
      disabled?: boolean;
      active?: boolean;
      onClick?: MouseEventHandler<HTMLButtonElement>;
    };
  };
}) => {
  return (
    <>
      <div
        className={twMerge(
          "flex w-fit items-center divide-x divide-ui-border",
          paperWrapperStyles,
          disabled &&
            "pointer-events-none cursor-default bg-ui-border shadow-md",
        )}
      >
        <div className="pl-1 pr-2">
          <ToolbarButton icon={faBars} buttonProps={buttonProps.MENU} />
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButton
            icon={faLocationArrow}
            iconProps={{ className: "fa-flip-horizontal" }}
            buttonProps={buttonProps.SELECT}
            tooltip="Select"
          />
          <ToolbarButton
            icon={faText}
            buttonProps={buttonProps.ADD_TEXT}
            tooltip="Add Text"
          />
          <Popover className="relative">
            <PopoverButton as={Fragment}>
              <button
                data-tooltip="Add..."
                className={twMerge(
                  "size-10 rounded-2xl p-2 hover:bg-secondary-500 hover:text-white",
                  toolTipStyles,
                )}
              >
                <FontAwesomeIcon icon={faFilePlus} />
              </button>
            </PopoverButton>
            <PopoverPanel
              anchor="bottom"
              className={twMerge(
                // "absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
                "flex flex-col [--anchor-gap:16px]",
                paperWrapperStyles,
              )}
            >
              <ToolbarButton icon={faImage} buttonProps={buttonProps.ADD_IMAGE}>
                Add Image
              </ToolbarButton>
              <ToolbarButton icon={faFilm} buttonProps={buttonProps.ADD_VIDEO}>
                Add Video
              </ToolbarButton>
            </PopoverPanel>
          </Popover>
          {/* <ToolbarButton
            icon={faCameraRotate}
            buttonProps={buttonProps.CHANGE_CAMERA_ORIENTATION}
            tooltip="Change Orientation"
          /> */}
          <ToolbarButton
            icon={faHatWizard}
            buttonProps={buttonProps.AI_STYLIZE}
            tooltip="AI Stylize"
          />
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButton
            icon={faArrowRotateLeft}
            buttonProps={buttonProps.UNDO}
            tooltip="Undo"
          />
          <ToolbarButton
            icon={faArrowRotateRight}
            buttonProps={buttonProps.REDO}
            tooltip="Redo"
          />
          <ToolbarButton
            icon={faFloppyDisk}
            buttonProps={buttonProps.SAVE}
            tooltip="Save"
          />
          <ToolbarButton
            icon={faCloudArrowDown}
            buttonProps={buttonProps.DOWNLOAD}
            tooltip="View & Download Videos"
          />
        </div>
      </div>
    </>
  );
};
