import { HTMLAttributes, useState } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/pro-thin-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import { Transition } from "@headlessui/react";
import ProfileDropdown from "./ProfileDropdown";

export interface LeftSidePanelProps extends HTMLAttributes<HTMLDivElement> {}

export const RightSidePanel = ({
  className,
  children,
  ...props
}: LeftSidePanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const colClasses = `col-start-10 col-span-3`;
  const buttonClasses =
    "w-6 bg-ui-panel border-ui-border border-l border-t border-b rounded-l-md py-4";
  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className={twMerge(buttonClasses, "fixed right-0 top-1 w-6")}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <Transition show={isOpen}>
        <div
          className={twMerge(
            "bg-ui-panel border-ui-border relative h-full border p-2 transition ease-in-out",
            colClasses,
            // Shared closed styles
            "data-[closed]:opacity-0",
            // Entering styles
            "data-[enter]:data-[closed]:translate-x-full data-[enter]:duration-100",
            // Leaving styles
            "data-[leave]:data-[closed]:translate-x-full data-[leave]:duration-300",

            //extra overriderclassnames
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-4">
            <div className="w-1/2">
              <img src="/brand/Storyteller-Logo.png" alt="Storyteller Logo" />
            </div>
            <span className="grow" />
            <ProfileDropdown />
          </div>
          <hr className="border-ui-divider my-2" />
          {children}

          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className={twMerge(buttonClasses, "absolute -left-6 top-1")}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </Transition>
    </>
  );
};
