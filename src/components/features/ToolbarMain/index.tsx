import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";
import { useCallback, useState } from "react";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faBars,
  faCameraRotate,
  faDownload,
  faFilePlus,
  faFilm,
  faFloppyDisk,
  // faHand,
  faHatWizard,
  faImage,
  faLocationArrow,

  // faPlus,
  // faMinus,
  faSquareDashed,
} from "@fortawesome/pro-thin-svg-icons";

import { ToolbarButtons } from "../ToolbarButtons";
import { twMerge } from "tailwind-merge";

import { UploadImage } from "../UploadImage";
import { UploadVideo } from "../UploadVideo";

// style constants
import { paperWrapperStyles } from "~/components/styles";

// for testing
import { layout } from "~/signals";

const initialState = {
  isUploadSubmenuOpen: false,
  isUploadVideoOpen: false,
  isUploadImageOpen: false,
};

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
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="col-span-12 col-start-1 row-span-1 row-start-12 justify-center">
      <div
        ref={toolbarCallbackRef}
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
                <ToolbarButtons
                  icon={faImage}
                  onClick={() =>
                    setState({
                      ...state,
                      isUploadImageOpen: true,
                      isUploadVideoOpen: false,
                    })
                  }
                />
                <ToolbarButtons
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
          <ToolbarButtons icon={faCameraRotate} />
          <ToolbarButtons icon={faHatWizard} />
        </div>
        <div className="flex items-center gap-2 px-2">
          <ToolbarButtons icon={faArrowRotateLeft} />
          <ToolbarButtons icon={faArrowRotateRight} />
          <ToolbarButtons icon={faFloppyDisk} />
          <ToolbarButtons icon={faDownload} />
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
