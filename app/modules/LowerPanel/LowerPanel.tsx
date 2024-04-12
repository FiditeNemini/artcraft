import React, { useCallback } from "react";
import { useMouseEventsTimeline } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsTimeline";
import {
  timelineScrollX,
  currentTime,
  dndTimelineHeight,
  overTimeline,
  scale,
  timelineHeight,
} from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

interface LowerPanelPropsI {
  children: React.ReactNode;
  onStyle?: boolean;
}

export const LowerPanel = ({ children, onStyle }: LowerPanelPropsI) => {
  const { onPointerDown } = useMouseEventsTimeline();

  const displayHeight =
    dndTimelineHeight.value > -1
      ? dndTimelineHeight.value
      : timelineHeight.value;

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        const newTime = Math.round(
          (event.clientX + timelineScrollX.value - 92) / 4 / scale.value,
        );
        if (newTime < 0) {
          return;
        }
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
    <>
      {!onStyle && (
        <div
          className="absolute w-full cursor-ns-resize bg-ui-panel-border"
          style={{ height: 3, zIndex: 1000, bottom: displayHeight }}
          onPointerDown={onPointerDown}
        />
      )}
      <div
        className={["absolute bottom-0", "w-screen", "bg-ui-panel"].join(" ")}
        style={{ height: onStyle ? 80 : displayHeight }}
        onPointerOver={() => {
          overTimeline.value = true;
        }}
        onPointerLeave={() => (overTimeline.value = false)}
        onPointerDown={onTimelineClick}
      >
        {children}
      </div>
    </>
  );
};
