import { useCallback, useLayoutEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

import { faXmark } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { TOP_BAR_HEIGHT } from "~/constants";

export const SidePanelInner = ({
  title,
  children,
  closeCallback,
}: {
  title?: string;
  children: React.ReactNode;
  closeCallback: () => void;
}) => {
  const [height, setHeight] = useState(0);
  const handleWindowResize = useCallback(() => {
    if (window) {
      setHeight(Math.ceil((window.innerHeight * 3) / 4) - TOP_BAR_HEIGHT);
    }
    return 0;
  }, []);

  useLayoutEffect(() => {
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  return (
    <div
      className="flex flex-col overflow-y-scroll border-y border-l border-ui-panel-border bg-ui-panel py-6 shadow-xl"
      style={{ height: height + "px" }}
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-start justify-between">
          {!title && <span />}
          {title && (
            <Dialog.Title className="text-base font-semibold leading-6 text-white">
              {title}
            </Dialog.Title>
          )}
          <div className="ml-3 flex h-7 items-center">
            <button
              type="button"
              className="relative rounded-md bg-brand-primary text-white hover:bg-brand-primary-400 focus:outline-none focus:ring-brand-primary-500"
              onClick={closeCallback}
            >
              {/* <span className="absolute -inset-2.5" /> */}
              <span className="sr-only">Close panel</span>
              <FontAwesomeIcon
                className="mx-1 mt-1 h-6 w-6"
                aria-hidden="true"
                icon={faXmark}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="relative mt-6 flex-1">{children}</div>
    </div>
  );
};
