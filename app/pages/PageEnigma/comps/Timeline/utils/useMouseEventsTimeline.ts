import React, { useCallback, useEffect, useState } from "react";
import { dndTimelineHeight, timelineHeight } from "~/pages/PageEnigma/store";
import { pageHeight } from "~/store";

export const useMouseEventsTimeline = () => {
  const [isActive, setIsActive] = useState(false);
  const [clientY, setClientY] = useState(0);

  useEffect(() => {
    const onPointerUp = (event: PointerEvent) => {
      if (isActive) {
        event.stopPropagation();
        event.preventDefault();
        timelineHeight.value = Math.round(dndTimelineHeight.value);
        setIsActive(false);
        dndTimelineHeight.value = -1;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isActive) {
        const delta = event.clientY - clientY;
        event.stopPropagation();
        event.preventDefault();
        if (timelineHeight.value - delta < 30) {
          return;
        }
        if (timelineHeight.value - delta > pageHeight.value * 0.5) {
          return;
        }
        dndTimelineHeight.value = timelineHeight.value - delta;
        return;
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [clientY, isActive]);

  return {
    onPointerDown: useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        event.stopPropagation();
        dndTimelineHeight.value = timelineHeight.value;
        setClientY(event.clientY);
        setIsActive(true);
      }
    }, []),
  };
};
