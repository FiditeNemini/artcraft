import React, { useCallback, useContext, useEffect, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

export const useMouseEventsHeight = () => {
  const { timelineHeight, setTimelineHeight } = useContext(TrackContext);
  const [isActive, setIsActive] = useState(false);
  const [clientY, setClientY] = useState(0);

  const [height, setHeight] = useState(-1);

  useEffect(() => {
    const onPointerUp = () => {
      if (isActive) {
        setTimelineHeight(height);
        setIsActive(false);
        setHeight(-1);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isActive) {
        const delta = event.clientY - clientY;
        event.stopPropagation();
        event.preventDefault();
        if (timelineHeight - delta < 30) {
          return;
        }
        setHeight(timelineHeight - delta);
        return;
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [clientY, isActive, height, timelineHeight, setTimelineHeight]);

  return {
    onPointerDown: useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button === 0) {
          event.stopPropagation();
          setClientY(event.clientY);
          setIsActive(true);
          setHeight(timelineHeight);
        }
      },
      [timelineHeight],
    ),
    height,
  };
};
