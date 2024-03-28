import React, { useCallback, useEffect, useState } from "react";
import { currentTime, scale } from "~/pages/PageEnigma/store";

export const useMouseEventsAnimation = () => {
  const [isActive, setIsActive] = useState("");
  const [clientX, setClientX] = useState(0);

  const [time, setTime] = useState(-1);

  useEffect(() => {
    const max = length * 60 * 4 * scale.value;

    const onPointerUp = () => {
      if (isActive) {
        currentTime.value = Math.round(time);
        setIsActive("");
        setTime(-1);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const delta =
        (event.clientX - clientX) / 4 / scale.value + currentTime.value;
      if (isActive === "drag") {
        event.stopPropagation();
        event.preventDefault();
        if (delta < 0 || delta > max) {
          return;
        }
        setTime(delta);
        return;
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
        setIsActive("drag");
        setTime(currentTime.value);
      }
    }, []),
    time,
  };
};
