import React, { useCallback, UIEvent } from "react";
import { useMouseEventsTimeline } from "~/pages/PageEnigma/comps/Timeline/utils/useMouseEventsTimeline";
import {
  currentScroll,
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
}

export const LowerPanel = ({ children }: LowerPanelPropsI) => {
  const { onPointerDown } = useMouseEventsTimeline();

  const displayHeight =
    dndTimelineHeight.value > -1
      ? dndTimelineHeight.value
      : timelineHeight.value;

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        const newTime = Math.round(
          (event.clientX + currentScroll.value - 92) / 4 / scale.value,
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

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    currentScroll.value = event.currentTarget.scrollLeft;
  }, []);

  return (
    <>
      <div
        className="absolute w-full cursor-ns-resize bg-ui-panel-border"
        style={{ height: 3, zIndex: 1000, bottom: displayHeight }}
        onPointerDown={onPointerDown}
      />
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
        onScroll={onScroll}
      >
        {children}
      </div>
    </>
  );
};
