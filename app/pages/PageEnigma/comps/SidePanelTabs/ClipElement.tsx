import { useCallback, useContext, useEffect, useState } from "react";
import { BaseClip } from "~/pages/PageEnigma/models/track";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";

interface Props {
  clip: BaseClip;
  type: "animations" | "lipSync";
}

export const ClipElement = ({ clip, type }: Props) => {
  const {
    startDrag,
    dragId,
    endDrag,
    scale,
    canDrop,
    setCanDrop,
    overTimeline,
    dropId,
  } = useContext(TrackContext);
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
      if (dragId) {
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
  }, [dragId, startDrag, endDrag, initX, initY]);

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
        setCanDrop(false);
      }
    },
    [type, clip.id, startDrag, setCanDrop],
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
          !canDrop ? "bg-brand-primary" : "bg-brand-secondary-700",
          dragId ? "block" : "hidden",
        ].join(" ")}
        style={{
          top: overTimeline ? y + 24 : y,
          left: overTimeline ? x : x,
          zIndex: 5000,
          width: overTimeline ? clip.length * 4 * scale : 64,
          height: overTimeline ? 32 : 64,
        }}
        onPointerDown={onPointerDown}
      >
        {clip.name}
      </div>
    </div>
  );
};
