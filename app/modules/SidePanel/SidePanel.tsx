import { useState } from "react";
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
    <div className={
      "relative border-l border-l-ui-panel-border bg-ui-panel transition-all duration-300 ease-in-out"
      + (isVisible ? " w-[23.5rem]" : " w-0")
      }
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="hover:bg-ui-controls-button absolute left-[-25px] top-1/2 flex rounded-l-lg bg-ui-controls px-2 py-3 align-middle text-sm text-white"
      >
        <FontAwesomeIcon icon={isVisible ? faChevronRight : faChevronLeft} />
      </button>
      <div className="relative w-[23.5rem] h-full">
        {children}
      </div>

    </div>
  );
};
