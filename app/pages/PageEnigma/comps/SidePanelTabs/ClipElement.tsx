import { useCallback, useContext, useEffect, useState } from "react";
import { BaseClip } from "~/pages/PageEnigma/models/track";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { canDrop, dragId, overTimeline, scale } from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

interface Props {
  clip: BaseClip;
  type: "animations" | "lipSync";
}

export const ClipElement = ({ clip, type }: Props) => {
  useSignals();
  const { startDrag, endDrag } = useContext(TrackContext);
  const [initPosition, setInitPosition] = useState<{
    initX: number;
    initY: number;
  }>({
    initX: 0,
    initY: 0,
  });
  const [currPosition, setCurrPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const { x, y } = currPosition;
  const { initX, initY } = initPosition;

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
        const deltaX = event.clientX - initX;
        const deltaY = event.clientY - initY;
        setCurrPosition({ x: deltaX, y: deltaY });
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
        const box = document.getElementById(`ani-clip-${clip.id}`);
        const position = box!.getBoundingClientRect();

        startDrag(type, clip.id);
        setCurrPosition({
          x: position.x,
          y: position.y + position.height + 1,
        });
        setInitPosition({
          initX: position.x,
          initY: position.y + position.height + 1,
        });
        canDrop.value = false;
      }
    },
    [type, clip.id, startDrag],
  );

  return (
    <div key={clip.id} className="relative h-16 w-16">
      <div
        id={`ani-clip-${clip.id}`}
        className="absolute block h-16 w-16 bg-brand-secondary-700"
        style={{ top: 0, left: 0 }}
        onPointerDown={onPointerDown}
      >
        {clip.name}
      </div>
      <div
        id={`ani-dnd-${clip.id}`}
        className={[
          "absolute p-2",
          "rounded-lg",
          !canDrop.value ? "bg-brand-primary" : "bg-brand-secondary-700",
          dragId.value ? "block" : "hidden",
        ].join(" ")}
        style={{
          top: overTimeline.value ? y + 24 : y,
          left: overTimeline.value ? x : x,
          zIndex: 5000,
          width: overTimeline.value ? clip.length * 4 * scale.value : 64,
          height: overTimeline.value ? 32 : 64,
        }}
        onPointerDown={onPointerDown}
      >
        {clip.name}
      </div>
    </div>
  );
};
