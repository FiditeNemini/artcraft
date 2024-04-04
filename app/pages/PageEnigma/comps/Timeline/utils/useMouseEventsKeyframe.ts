import React, { Dispatch, useCallback, useEffect, useRef } from "react";
import { Keyframe } from "~/pages/PageEnigma/models/track";
import {
  canDrop,
  scale,
  showDuplicateOffsetWarning,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

export const useMouseEventsKeyframe = ({
  keyframe,
  max,
  min,
  updateKeyframe,
  setOffset,
}: {
  keyframe: Keyframe;
  max: number;
  min: number;
  updateKeyframe: (args: { id: string; offset: number }) => void;
  setOffset: Dispatch<number>;
}) => {
  useSignals();
  const currOffset = useRef(keyframe.offset);
  const initOffset = useRef(keyframe.offset);
  const isActive = useRef("");
  const clientX = useRef(0);

  const onPointerUp = useCallback(() => {
    if (isActive.current) {
      updateKeyframe({
        id: keyframe.keyframe_uuid,
        offset: Math.round(currOffset.current),
      });
      isActive.current = "";
      canDrop.value = false;
    }
  }, [updateKeyframe, keyframe.keyframe_uuid]);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const delta = (event.clientX - clientX.current) / 4 / scale.value;
      const deltaOffset = delta + initOffset.current;
      if (isActive.current === "drag") {
        if (deltaOffset < min) {
          currOffset.current = min;
        } else if (deltaOffset > max) {
          currOffset.current = max;
        } else {
          currOffset.current = deltaOffset;
        }
        setOffset(currOffset.current);
      }
    },
    [max, min, setOffset],
  );

  useEffect(() => {
    currOffset.current = keyframe.offset;
    initOffset.current = keyframe.offset;
  }, [keyframe.offset]);

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
        event.stopPropagation();
        event.preventDefault();
        clientX.current = event.clientX;
        isActive.current = type;
      }
    },
  };
};
