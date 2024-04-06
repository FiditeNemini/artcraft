import { useCallback, useContext, useEffect } from "react";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import {
  canDrop,
  currPosition,
  dragItem,
  initPosition,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

interface Props {
  item: MediaItem;
  type: AssetType;
}

export const AnimationElement = ({ item, type }: Props) => {
  useSignals();
  const { startDrag, endDrag } = useContext(TrackContext);
  const { initX, initY } = initPosition.value;

  useEffect(() => {
    const onPointerUp = () => {
      if (dragItem.value) {
        endDrag();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (dragItem.value) {
        event.stopPropagation();
        event.preventDefault();
        const deltaX = event.pageX - initX;
        const deltaY = event.pageY - initY;
        currPosition.value = { currX: initX + deltaX, currY: initY + deltaY };
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
        startDrag(item);
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
    [item, startDrag],
  );

  return (
    <div
      className="relative rounded-lg"
      style={{ width: 91, height: 114 }}
      onPointerDown={onPointerDown}
    >
      <img src={item.thumbnail} alt={item.name} className="rounded-t-lg" />
      <div
        className="w-full rounded-b-lg py-1 text-center text-sm"
        style={{ backgroundColor: "#39394D" }}
      >
        {item.name}
      </div>
    </div>
  );
};
