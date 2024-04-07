import {
  dndSidePanelWidth,
  pageHeight,
  sidePanelWidth,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { ShapeElements } from "~/pages/PageEnigma/comps/SidePanelTabs/shapes/ShapeElements";

export const ShapeTab = () => {
  useSignals();
  const height = pageHeight.value - timelineHeight.value;
  const displayWidth =
    dndSidePanelWidth.value > -1
      ? dndSidePanelWidth.value
      : sidePanelWidth.value;

  return (
    <>
      <div className="p-2 text-base font-bold">Shapes</div>
      <div
        className="mt-2 overflow-y-auto px-2 pt-2"
        style={{ height: height - 140, width: displayWidth }}
      >
        <ShapeElements />
      </div>
    </>
  );
};
