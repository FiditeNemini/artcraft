import React, { useCallback, useEffect, useState } from "react";
import { currentTime, filmLength, scale } from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export const useMouseEventsScrubber = () => {
  const [isActive, setIsActive] = useState(false);
  const [clientX, setClientX] = useState(0);

  const [time, setTime] = useState(-1);

  useEffect(() => {
    const max = filmLength.value * 60;

    const onPointerUp = () => {
      if (isActive) {
        currentTime.value = Math.round(time);
        setIsActive(false);
        setTime(-1);
        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.UPDATE_TIME,
          data: { currentTime: Math.round(time) },
        });
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const delta = Math.round(
        (event.clientX - clientX) / 4 / scale.value + currentTime.value,
      );
      if (isActive) {
        event.stopPropagation();
        event.preventDefault();
        console.log(delta, max);
        if (delta < 0 || delta > max) {
          return;
        }
        setTime((oldTime) => {
          if (oldTime !== delta) {
            Queue.publish({
              queueName: QueueNames.TO_ENGINE,
              action: toEngineActions.UPDATE_TIME,
              data: {
                currentTime: delta,
              },
            });
          }
          return delta;
        });
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [clientX, isActive, time]);

  return {
    onPointerDown: useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        setClientX(event.clientX);
        setIsActive(true);
        setTime(currentTime.value);
      }
    }, []),
    time,
  };
};
