import { HTMLAttributes, useState } from "react";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-thin-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import { Transition } from "@headlessui/react";

export const PanelBottom = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = useState(true);

  const buttonClasses =
    "w-12 h-6 bg-ui-panel border-ui-border border-l border-t border-r rounded-t-md px-4 flex items-center justify-center";
  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className={twMerge(buttonClasses, "fixed bottom-0 left-1")}
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
      )}
      <Transition show={isOpen}>
        <div
          className={twMerge(
            "bg-ui-panel border-ui-border relative border p-2 transition ease-in-out",
            "col-span-12 col-start-1 row-span-3 row-start-10",
            // Shared closed styles
            "data-[closed]:opacity-0",
            // Entering styles
            "data-[enter]:data-[closed]:translate-y-full data-[enter]:duration-100",
            // Leaving styles
            "data-[leave]:data-[closed]:translate-y-full data-[leave]:duration-300",

            //extra overriderclassnames
            className,
          )}
          {...props}
        >
          {children}

          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className={twMerge(buttonClasses, "absolute -top-6 left-1")}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
      </Transition>
    </>
  );
};
