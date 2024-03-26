import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { BaseClip } from "~/models/track";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

export const useMouseEventsClip = (
  clip: BaseClip,
  max: number,
  min: number,
  updateClip: (args: { id: string; offset: number; length: number }) => void,
  setState: Dispatch<{ length: number; offset: number }>,
) => {
  const currLength = useRef(clip.length);
  const currOffset = useRef(clip.offset);
  const initLength = useRef(clip.length);
  const initOffset = useRef(clip.offset);
  const isActive = useRef("");
  const clientX = useRef(0);

  const { scale } = useContext(TrackContext);

  const onPointerUp = useCallback(() => {
    if (isActive.current) {
      updateClip({
        id: clip.id,
        offset: Math.round(currOffset.current),
        length: Math.round(currLength.current),
      });
      isActive.current = "";
    }
  }, [updateClip, clip.id]);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const delta = (event.clientX - clientX.current) / 4 / scale;
      const deltaOffset = delta + initOffset.current;
      if (isActive.current === "drag") {
        if (deltaOffset < min || deltaOffset + currLength.current > max) {
          return;
        }
        currOffset.current = deltaOffset;
      }
      if (isActive.current === "left") {
        if (deltaOffset < min) {
          return;
        }
        currOffset.current = deltaOffset;
        currLength.current = initLength.current - delta;
      }
      if (isActive.current === "right") {
        if (
          initLength.current + delta < 30 ||
          currOffset.current + initLength.current + delta > max
        ) {
          return;
        }
        currLength.current = initLength.current - delta;
      }
      setState({ length: currLength.current, offset: currOffset.current });
    },
    [max, min, scale, setState],
  );

  useEffect(() => {
    currLength.current = clip.length;
    currOffset.current = clip.offset;
    initLength.current = clip.length;
    initOffset.current = clip.offset;
  }, [clip.length, clip.offset]);

  useEffect(() => {
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [onPointerUp, onMouseMove]);

  return {
    onPointerDown: (
      event: React.PointerEvent<HTMLButtonElement>,
      type: string,
    ) => {
      if (event.button === 0) {
        clientX.current = event.clientX;
        isActive.current = type;
      }
    },
  };
};
