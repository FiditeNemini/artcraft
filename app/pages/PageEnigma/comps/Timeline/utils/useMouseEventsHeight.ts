import React, { useCallback, useEffect, useState } from "react";
import { timelineHeight } from "~/pages/PageEnigma/store";

export const useMouseEventsHeight = () => {
  const [isActive, setIsActive] = useState(false);
  const [clientY, setClientY] = useState(0);

  const [height, setHeight] = useState(-1);

  useEffect(() => {
    const onPointerUp = () => {
      if (isActive) {
        timelineHeight.value = Math.round(height);
        setIsActive(false);
        setHeight(-1);
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
        setHeight(timelineHeight.value - delta);
        return;
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [clientY, isActive, height]);

  return {
    onPointerDown: useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        event.stopPropagation();
        setClientY(event.clientY);
        setIsActive(true);
        setHeight(timelineHeight.value);
      }
    }, []),
    height,
  };
};
