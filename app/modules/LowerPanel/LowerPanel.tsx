import React from "react";
import { useMouseEventsTimeline } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsTimeline";
import {
  dndTimelineHeight,
  overTimeline,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import useTimelineClick from "~/pages/PageEnigma/comps/Timeline/utils/useTimelineClick";
import { Pages } from "~/pages/PageEnigma/constants/page";

interface LowerPanelPropsI {
  children: React.ReactNode;
}

export const LowerPanel = ({ children }: LowerPanelPropsI) => {
  const { onPointerDown } = useMouseEventsTimeline();

  const displayHeight =
    dndTimelineHeight.value > -1
      ? dndTimelineHeight.value
      : timelineHeight.value;

  const onTimelineClick = useTimelineClick(Pages.EDIT);

  return (
    <>
      <div
        className="absolute w-full cursor-ns-resize bg-ui-panel-border"
        style={{ height: 3, zIndex: 1000, bottom: displayHeight }}
        onPointerDown={onPointerDown}
      />
      <div
        className={["absolute bottom-0", "w-screen", "bg-ui-panel"].join(" ")}
        style={{ height: displayHeight }}
        onPointerOver={() => {
          overTimeline.value = true;
        }}
        onPointerLeave={() => (overTimeline.value = false)}
        onClick={onTimelineClick}>
        {children}
      </div>
    </>
  );
};
