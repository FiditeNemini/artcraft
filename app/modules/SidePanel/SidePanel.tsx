import { useState } from "react";
import { Tabs } from "../Tabs";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";

export const SidePanel = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="relative border-l border-l-ui-panel-border">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="hover:bg-ui-controls-button absolute left-[-25px] top-1/2 flex rounded-l-lg bg-ui-controls px-2 py-3 align-middle text-sm text-white transition duration-150 ease-in-out"
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
        <Tabs
          tabs={[
            {
              header: "Animation",
              children: <p>Animation Tab</p>,
            },
            {
              header: "Camera",
              children: <p>Camera Tab</p>,
            },
            {
              header: "Audio",
              children: <p>Audio Tab</p>,
            },
            {
              header: "Styling",
              children: <p>Styling Tab</p>,
            },
          ]}
        />
      </Transition>
    </div>
  );
};
