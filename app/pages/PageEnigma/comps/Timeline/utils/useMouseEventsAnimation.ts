import React, { useContext, useEffect, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

export const useMouseEventsAnimation = () => {
  const { currentTime, updateCurrentTime, length, scale } =
    useContext(TrackContext);
  const [isActive, setIsActive] = useState("");
  const [clientX, setClientX] = useState(0);

  const [time, setTime] = useState(currentTime);

  useEffect(() => {
    const max = length * 60 * 4 * scale;

    const onPointerUp = () => {
      if (isActive) {
        updateCurrentTime(Math.round(time));
        setIsActive("");
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const delta = (event.clientX - clientX) / 4 / scale + currentTime;
      if (isActive === "drag") {
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
  }, [clientX, isActive, length, updateCurrentTime, scale, time]);

  return {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        setClientX(event.clientX);
        setIsActive("drag");
      }
    },
    time,
  };
};
