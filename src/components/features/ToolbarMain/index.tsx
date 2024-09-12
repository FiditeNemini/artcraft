import { MouseEventHandler, useCallback, useState } from "react";
import { useSignalEffect } from "@preact/signals-react/runtime";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faBars,
  faCameraRotate,
  faDownload,
  faFilePlus,
  faFilm,
  faFloppyDisk,
  faHatWizard,
  faImage,
  faLocationArrow,
  faSquareDashed,
} from "@fortawesome/pro-solid-svg-icons";

import { ToolbarButton } from "../ToolbarButton";
import { twMerge } from "tailwind-merge";

import { DialogAddImage } from "../DialogAddImage";
import { DialogAddVideo } from "../DialogAddVideo";
import { DialogAiStylize } from "../DialogAiStylize";

// style constants
import { paperWrapperStyles } from "~/components/styles";

// for testing
import { layout } from "~/signals";

import { ToolbarMainButtonNames } from "./enum";

const initialState = {
  isAddSubmenuOpen: false,
  isAddVideoOpen: false,
  isAddImageOpen: false,
  isAiStylizeOpen: false,
};

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
  //// for testing
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
  const [state, setState] = useState(initialState);

  const toolbarCallbackRef = useCallback((node: HTMLDivElement) => {
    function handleClickOutside(e: MouseEvent) {
      if (!node.contains(e.target as Node)) {
        setState((curr) => ({ ...curr, isUploadSubmenuOpen: false }));
      }
    }
    if (node) {
      window.addEventListener("click", handleClickOutside);
    }
  }, []);

  const closeAll = useCallback(() => {
    setState(initialState);
  }, []);
  const openAddSubmenu = useCallback(() => {
    setState({
      ...initialState, //this closes all other opened things
      isAddSubmenuOpen: true,
    });
  }, []);
  const openAddImage = useCallback(() => {
    setState({
      ...initialState, //this closes all other opened things
      isAddImageOpen: true,
    });
  }, []);
  const openAddVideo = useCallback(() => {
    setState({
      ...initialState, //this closes all other opened things
      isAddVideoOpen: true,
    });
  }, []);
  const openAIStylize = useCallback(() => {
    setState({
      ...initialState, //this closes all other opened things
      isAiStylizeOpen: true,
    });
  }, []);

  return (
    <div className="col-span-12 col-start-1 row-span-1 row-start-12 justify-center">
      <div
        ref={toolbarCallbackRef}
        className={twMerge(
          "m-auto flex w-fit items-center divide-x divide-ui-border",
          paperWrapperStyles,
          disabled &&
            "pointer-events-none cursor-default bg-ui-border shadow-md",
        )}
      >
        <div className="flex items-center gap-2 px-2">
          <ToolbarButton icon={faBars} buttonProps={buttonProps.MENU} />
          <ToolbarButton
            icon={faLocationArrow}
            iconProps={{ className: "fa-flip-horizontal" }}
            buttonProps={buttonProps.SELECT_ONE}
            tooltip="Select"
          />
          <ToolbarButton
            icon={faSquareDashed}
            buttonProps={buttonProps.SELECT_AREA}
            tooltip="Select Area"
          />
          <div className="relative">
            <ToolbarButton
              icon={faFilePlus}
              onClick={openAddSubmenu}
              tooltip={state.isAddSubmenuOpen ? undefined : "Add..."}
            />
            {state.isAddSubmenuOpen && (
              <div
                className={twMerge(
                  "absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2",
                  paperWrapperStyles,
                )}
              >
                <ToolbarButton icon={faImage} onClick={openAddImage}>
                  Add Image
                </ToolbarButton>
                <ToolbarButton icon={faFilm} onClick={openAddVideo}>
                  Add Video
                </ToolbarButton>
              </div>
            )}
          </div>
          <ToolbarButton
            icon={faCameraRotate}
            buttonProps={buttonProps.CHANGE_CAMERA_ORIENTATION}
            tooltip="Change Orientation"
          />
          <ToolbarButton
            icon={faHatWizard}
            buttonProps={buttonProps.AI_STYLIZE}
            onClick={openAIStylize}
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
            icon={faDownload}
            buttonProps={buttonProps.DOWNLOAD}
            tooltip="Download"
          />
        </div>
      </div>

      <DialogAddImage
        isOpen={state.isAddImageOpen ?? false}
        closeCallback={closeAll}
      />
      <DialogAddVideo
        isOpen={state.isAddVideoOpen ?? false}
        closeCallback={closeAll}
      />
      <DialogAiStylize
        isOpen={state.isAiStylizeOpen ?? false}
        closeCallback={closeAll}
      />
    </div>
  );
};
