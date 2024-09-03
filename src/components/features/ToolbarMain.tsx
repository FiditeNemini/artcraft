import { useSignals } from "@preact/signals-react/runtime";
import { faPlusLarge } from "@fortawesome/pro-thin-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { layout } from "~/signals";
export const ToolbarMain = () => {
  useSignals();
  const {
    signals: { isMobile, windowWidth, windowHeight },
  } = layout;
  return (
    <div className="col-span-10 col-start-2 row-span-1 row-start-12">
      <div className="flex items-center justify-center gap-2 rounded-lg border border-ui-border bg-ui-panel p-2">
        <p>
          Layout is {windowWidth.value} x {windowHeight.value},{" "}
          <b>{isMobile.value ? "Mobile" : "Not Mobile"}</b>
        </p>
        <button className="size-10 rounded-lg p-2 hover:bg-secondary-500 hover:text-white">
          <FontAwesomeIcon icon={faPlusLarge} />
        </button>
      </div>
    </div>
  );
};
