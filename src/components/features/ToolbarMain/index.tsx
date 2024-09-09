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

import { UploadImage } from "../UploadImage";
import { UploadVideo } from "../UploadVideo";

// style constants
import { paperWrapperStyles } from "~/components/styles";

// for testing
import { layout } from "~/signals";

import { ToolbarMainButtonNames } from "./enum";

const initialState = {
  isUploadSubmenuOpen: false,
  isUploadVideoOpen: false,
  isUploadImageOpen: false,
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
        setState(initialState);
      }
    }
    if (node) {
      window.addEventListener("click", handleClickOutside);
    }
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
          />
          <ToolbarButton
            icon={faSquareDashed}
            buttonProps={buttonProps.SELECT_AREA}
          />
          <div className="relative">
            <ToolbarButton
              icon={faFilePlus}
              onClick={() => {
                setState({ ...state, isUploadSubmenuOpen: true });
              }}
            />
            {state.isUploadSubmenuOpen && (
              <div
                className={twMerge(
                  "absolute -left-2 bottom-11 z-10",
                  paperWrapperStyles,
                )}
              >
                <ToolbarButton
                  icon={faImage}
                  onClick={() =>
                    setState({
                      ...state,
                      isUploadImageOpen: true,
                      isUploadVideoOpen: false,
                    })
                  }
                />
                <ToolbarButton
                  icon={faFilm}
                  onClick={() =>
                    setState({
                      ...state,
                      isUploadVideoOpen: true,
                      isUploadImageOpen: false,
                    })
                  }
                />
              </div>
            )}
          </div>
          <ToolbarButton
            icon={faCameraRotate}
            buttonProps={buttonProps.CHANGE_CAMERA_ORIENTATION}
          />
          <ToolbarButton
            icon={faHatWizard}
            buttonProps={buttonProps.AI_STYLIZE}
          />
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButton
            icon={faArrowRotateLeft}
            buttonProps={buttonProps.UNDO}
          />
          <ToolbarButton
            icon={faArrowRotateRight}
            buttonProps={buttonProps.REDO}
          />
          <ToolbarButton icon={faFloppyDisk} buttonProps={buttonProps.SAVE} />
          <ToolbarButton icon={faDownload} buttonProps={buttonProps.DOWNLOAD} />
        </div>
      </div>

      <UploadImage
        isOpen={state.isUploadImageOpen ?? false}
        closeCallback={() => setState({ ...state, isUploadImageOpen: false })}
      />
      <UploadVideo
        isOpen={state.isUploadVideoOpen ?? false}
        closeCallback={() => setState({ ...state, isUploadVideoOpen: false })}
      />
    </div>
  );
};
