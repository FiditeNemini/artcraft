import React, { useCallback } from "react";
import { useMouseEventsHeight } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsHeight";
import {
  currentTime,
  overTimeline,
  scale,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

interface LowerPanelPropsI {
  children: React.ReactNode;
}

export const LowerPanel = ({ children }: LowerPanelPropsI) => {
  const { onPointerDown, height } = useMouseEventsHeight();

  const displayHeight = height > -1 ? height : timelineHeight.value;

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        const newTime = Math.round((event.clientX - 92) / 4 / scale.value);
        currentTime.value = newTime;
        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.UPDATE_TIME,
          data: { currentTime: Math.round(newTime) },
        });
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
