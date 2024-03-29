import { useCallback, useContext, useEffect } from "react";
import { MediaClip } from "~/pages/PageEnigma/models/track";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import {
  canDrop,
  currPosition,
  dragId,
  initPosition,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

interface Props {
  clip: MediaClip;
  type: "animations" | "lipSync";
}

export const ClipElement = ({ clip, type }: Props) => {
  useSignals();
  const { startDrag, endDrag } = useContext(TrackContext);
  const { initX, initY } = initPosition.value;

  useEffect(() => {
    const onPointerUp = () => {
      if (dragId.value) {
        endDrag();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (dragId) {
        event.stopPropagation();
        event.preventDefault();
        const deltaX = event.pageX - initX;
        const deltaY = event.pageY - initY;
        currPosition.value = { currX: initX + deltaX, currY: initY + deltaY };
        return;
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [startDrag, endDrag, initX, initY]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        console.log("X", event.clientX);
        startDrag(type, clip.media_id, clip.length);
        currPosition.value = {
          currX: event.pageX,
          currY: event.pageY,
        };
        initPosition.value = {
          initX: event.pageX,
          initY: event.pageY,
        };
        canDrop.value = false;
      }
    },
    [type, clip.media_id, startDrag, clip.length],
  );

  return (
    <div className="relative h-16 w-16">
      <div
        id={`ani-clip-${clip.media_id}`}
        className="absolute block h-16 w-16 rounded-lg bg-brand-secondary-700 p-2"
        style={{ top: 0, left: 0 }}
        onPointerDown={onPointerDown}
      >
        {clip.name}
      </div>
    </div>
  );
};
