import { useCallback, useContext, useEffect } from "react";
import { MediaItem } from "~/pages/PageEnigma/models";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import {
  canDrop,
  currPosition,
  dragItem,
  initPosition,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

interface Props {
  debug?: string;
  item: MediaItem;
}

export const ItemElement = ({ item }: Props) => {
  useSignals();
  const { startDrag, endDrag } = useContext(TrackContext);
  const { initX, initY } = initPosition.value;
  const thumbnail = item.thumbnail
    ? item.thumbnail
    : `/resources/images/default-covers/${item.imageIndex}.webp`;

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
      className="sidebar-object-item relative w-full cursor-pointer rounded-lg transition-all duration-200"
      onPointerDown={onPointerDown}>
      <img
        {...{
          crossOrigin: "anonymous",
          src: thumbnail,
        }}
        alt={item.name}
        className="aspect-[4.5/5] w-full rounded-t-lg object-cover object-center"
      />
      <div
        className="text-overflow-ellipsis w-full rounded-b-lg px-2 py-1.5 text-center text-sm"
        style={{ backgroundColor: "#39394D" }}>
        {item.name || item.media_id}
      </div>
    </div>
  );
};
