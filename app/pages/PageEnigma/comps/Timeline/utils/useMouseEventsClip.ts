import React, { useContext, useEffect, useState } from "react";
import { BaseClip } from "~/models/track";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

export const useMouseEventsClip = (
  clip: { id: string; offset: number; length: number; name: string },
  max: number,
  min: number,
  updateClip: (options: { id: string; offset: number; length: number }) => void,
) => {
  const [isActive, setIsActive] = useState("");
  const [clientX, setClientX] = useState(0);

  const [offset, setOffset] = useState(clip.offset);
  const [length, setLength] = useState(clip.length);

  const { scale } = useContext(TrackContext);

  useEffect(() => {
    const onPointerUp = () => {
      if (isActive) {
        updateClip({
          id: clip.id,
          offset: Math.round(offset),
          length: Math.round(length),
        } as BaseClip);
        setIsActive("");
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const delta = (event.clientX - clientX) / 4 / scale;
      const deltaOffset = delta + clip.offset;
      if (isActive === "drag") {
        if (deltaOffset < min || deltaOffset + length > max) {
          return;
        }
        setOffset(deltaOffset);
        return;
      }
      if (isActive === "left") {
        if (deltaOffset < min) {
          return;
        }
        setOffset(deltaOffset);
        setLength(clip.length - delta);
        return;
      }
      if (isActive === "right") {
        if (clip.length + delta < 30 || offset + clip.length + delta > max) {
          return;
        }
        setLength(clip.length + delta);
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [clientX, clip, min, max, isActive, length, offset, updateClip, scale]);

  return {
    onPointerDown: (
      event: React.PointerEvent<HTMLButtonElement>,
      type: string,
    ) => {
      if (event.button === 0) {
        setClientX(event.clientX);
        setIsActive(type);
      }
    },
    length,
    offset,
  };
};
