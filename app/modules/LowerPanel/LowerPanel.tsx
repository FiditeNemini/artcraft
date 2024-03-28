import React, { useCallback } from "react";
import { useMouseEventsHeight } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsHeight";
import {
  currentTime,
  overTimeline,
  scale,
  timelineHeight,
} from "~/pages/PageEnigma/store";

interface LowerPanelPropsI {
  children: React.ReactNode;
}

export const LowerPanel = ({ children }: LowerPanelPropsI) => {
  const { onPointerDown, height } = useMouseEventsHeight();

  const displayHeight = height > -1 ? height : timelineHeight.value;

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        currentTime.value = (Math.round(event.clientX) - 92) / 4 / scale.value;
      }
    },
    [],
  );

  return (
    <div
      className={[
        "absolute bottom-0",
        "w-screen overflow-auto",
        "bg-ui-panel",
      ].join(" ")}
      style={{ height: displayHeight }}
      onPointerOver={() => {
        overTimeline.value = true;
      }}
      onPointerLeave={() => (overTimeline.value = false)}
      onPointerDown={onTimelineClick}
    >
      <div
        className="w-full cursor-ns-resize bg-ui-panel-border"
        style={{ height: 3, zIndex: 1000 }}
        onPointerDown={onPointerDown}
      />
      {children}
    </div>
  );
};
