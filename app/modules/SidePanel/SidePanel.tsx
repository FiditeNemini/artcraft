import { useState } from "react";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";

interface Props {
  children: React.ReactNode;
}

export const SidePanel = ({ children }: Props) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="relative border-l border-l-ui-panel-border bg-ui-panel">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute left-[-25px] top-1/2 flex rounded-l-lg bg-ui-controls px-2 py-3 align-middle text-sm text-white transition duration-150 ease-in-out hover:bg-ui-controls-button"
      >
        <FontAwesomeIcon icon={isVisible ? faChevronRight : faChevronLeft} />
      </button>
      <Transition
        show={isVisible}
        enter="transition-transform duration-300"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-300"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        {children}
      </Transition>
    </div>
  );
};
