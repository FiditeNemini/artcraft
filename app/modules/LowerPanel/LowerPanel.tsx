import React, { useCallback, useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useMouseEventsHeight } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsHeight";

interface LowerPanelPropsI {
  children: React.ReactNode;
}

export const LowerPanel = ({ children }: LowerPanelPropsI) => {
  const { setOverTimeline, updateCurrentTime, scale, timelineHeight } =
    useContext(TrackContext);
  const { onPointerDown, height } = useMouseEventsHeight();

  const displayHeight = height > -1 ? height : timelineHeight;

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        updateCurrentTime((Math.round(event.clientX) - 92) / 4 / scale);
      }
    },
    [updateCurrentTime, scale],
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
        setOverTimeline(true);
      }}
      onPointerLeave={() => setOverTimeline(false)}
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
